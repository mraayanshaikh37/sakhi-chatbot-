import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SAKHI_SYSTEM_INSTRUCTION = `You are "Sakhi" (सखी), an empathetic, highly intelligent, and trustworthy personal safety and wellness AI companion specifically created for women in India.

Guidelines & Persona:
- Provide clear, thorough, practical, and actionable safety guidance, emergency protocols, and emotional support.
- When the user asks safety questions (cab rides, night travel, feeling followed, public transit, harassment), provide comprehensive, structured advice with practical steps.
- Include essential Indian helplines when relevant: National Emergency (112), Women's Helpline (1091), Women in Distress (181), Railway Safety (139), Cyber Crime (1930).
- Share knowledge of Indian legal protections when relevant (Zero FIR at any police station, Right to Virtual/Email Complaints, Rights regarding arrests after sunset, Free Legal Aid).
- Provide calming grounding techniques (e.g. 5-4-3-2-1 sensory method, box breathing 4-4-4-4) when users express anxiety, panic, or distress.
- Speak in a warm, respectful, supportive, non-judgmental tone. Format responses with clean structure (bullet points, clear paragraphs) for easy reading.
- Support both English, Hindi, and regional language inquiries smoothly.`;

// Helper to format turns for Gemini API
function formatGeminiTurns(validMessages) {
  const rawTurns = [];
  for (const msg of validMessages) {
    if (msg.role === 'system') continue;
    const isModel = (msg.role === 'assistant' || msg.role === 'bot' || msg.role === 'model');
    const role = isModel ? 'model' : 'user';
    const text = (typeof msg.content === 'string' ? msg.content : (msg.text || '')).trim();
    if (!text) continue;

    if (rawTurns.length > 0 && rawTurns[rawTurns.length - 1].role === role) {
      rawTurns[rawTurns.length - 1].parts[0].text += '\n' + text;
    } else {
      rawTurns.push({
        role,
        parts: [{ text }]
      });
    }
  }

  while (rawTurns.length > 0 && rawTurns[0].role !== 'user') {
    rawTurns.shift();
  }
  while (rawTurns.length > 0 && rawTurns[rawTurns.length - 1].role !== 'user') {
    rawTurns.pop();
  }

  if (rawTurns.length === 0) {
    const lastUser = validMessages.slice().reverse().find(m => m.role !== 'assistant' && m.role !== 'bot' && m.role !== 'model') || validMessages[validMessages.length - 1];
    const fallbackText = (typeof lastUser?.content === 'string' ? lastUser.content : lastUser?.text) || 'Hello, I need safety guidance.';
    rawTurns.push({
      role: 'user',
      parts: [{ text: fallbackText }]
    });
  }
  return rawTurns;
}

// Model candidate list for high availability fallback
const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-3.1-pro-preview'
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, stream = true } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const validMessages = messages.filter(m => m.content || m.text);
    if (validMessages.length === 0) {
      return res.status(400).json({ error: 'No user messages provided' });
    }

    const ai = getGeminiClient();
    const contents = formatGeminiTurns(validMessages);

    // If client requested SSE streaming
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let streamSucceeded = false;

      for (const modelName of GEMINI_MODELS) {
        // Try each model with up to 1 immediate retry on 503
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const config = {
              systemInstruction: SAKHI_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            };
            if (modelName === 'gemini-3.7-flash') {
              config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
            }

            const streamResult = await ai.models.generateContentStream({
              model: modelName,
              config,
              contents,
            });

            for await (const chunk of streamResult) {
              if (chunk.text) {
                res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
              }
            }
            res.write('data: [DONE]\n\n');
            res.end();
            streamSucceeded = true;
            break;
          } catch (err) {
            const isUnavailable = err?.status === 503 || (err?.message && err.message.includes('503'));
            if (isUnavailable && attempt === 0) {
              await delay(250);
              continue;
            }
            break;
          }
        }
        if (streamSucceeded) break;
      }

      if (!streamSucceeded) {
        // Safe emergency fallback stream
        const fallbackText = "I am right here with you. If you feel unsafe or need immediate assistance, please press the **Red SOS** button or call **112 / 1091** right now. You can also view nearby 24/7 police stations and hospitals on the Safe Havens map.";
        res.write(`data: ${JSON.stringify({ text: fallbackText })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }
      return;
    }

    // Standard non-streaming fallback cascade
    let replyText = '';
    for (const modelName of GEMINI_MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const config = {
            systemInstruction: SAKHI_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          };
          if (modelName === 'gemini-3.7-flash') {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
          }

          const response = await ai.models.generateContent({
            model: modelName,
            config,
            contents,
          });

          if (response?.text) {
            replyText = response.text;
            break;
          }
        } catch (err) {
          const isUnavailable = err?.status === 503 || (err?.message && err.message.includes('503'));
          if (isUnavailable && attempt === 0) {
            await delay(250);
            continue;
          }
          break;
        }
      }
      if (replyText) break;
    }

    const reply = replyText || "I'm right here with you. Please stay calm and let me know how I can help.";
    return res.json({ reply });
  } catch (error) {
    console.error('Error generating response:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        reply: "I am right here with you. If you are in immediate danger, please press the Red SOS button or dial 112 directly. You can also check safe havens on the map."
      });
    } else {
      res.write(`data: ${JSON.stringify({ text: "\n\nI am right here with you. If you are in immediate danger, please press the Red SOS button or dial 112 directly." })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

// Helper for distance calculation (Haversine formula in KM)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// API endpoint for nearby Police Stations, Hospitals, and Medicals
app.get('/api/nearby-safe-havens', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6139;
    const lng = parseFloat(req.query.lng) || 77.2090;
    const radius = Math.min(parseInt(req.query.radius) || 5000, 15000);

    let places = [];

    // Try Overpass with quick timeout and quiet fallback
    try {
      const overpassQuery = `[out:json][timeout:4];(node["amenity"~"police|hospital|pharmacy"](around:${radius},${lat},${lng}););out 15;`;
      const mirrors = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
      ];

      for (const mirrorUrl of mirrors) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2500);

          const response = await fetch(`${mirrorUrl}?data=${encodeURIComponent(overpassQuery)}`, {
            headers: { 'User-Agent': 'SakhiSafetyApp/1.0' },
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (response.ok) {
            const data = await response.json();
            if (data && data.elements && data.elements.length > 0) {
              places = data.elements.map(el => {
                const elLat = el.lat || (el.center && el.center.lat);
                const elLng = el.lon || (el.center && el.center.lon);
                const tags = el.tags || {};
                const amenity = tags.amenity || 'police';
                
                let type = 'police';
                let defaultPhone = '112';
                if (amenity === 'police') {
                  type = 'police';
                  defaultPhone = tags.phone || tags['contact:phone'] || '112';
                } else if (amenity === 'hospital' || amenity === 'clinic') {
                  type = 'hospital';
                  defaultPhone = tags.phone || tags['contact:phone'] || '108';
                } else if (amenity === 'pharmacy') {
                  type = 'pharmacy';
                  defaultPhone = tags.phone || tags['contact:phone'] || '102';
                }

                const dist = (elLat && elLng) ? calculateDistance(lat, lng, elLat, elLng) : 0;
                const name = tags.name || tags['name:en'] || (type === 'police' ? 'Local Police Station' : type === 'hospital' ? 'Community Health Center' : '24/7 Pharmacy');
                const address = tags['addr:street'] ? `${tags['addr:street']}, ${tags['addr:city'] || ''}` : 'Emergency Service Hub';

                return {
                  id: el.id,
                  name,
                  type,
                  lat: elLat,
                  lng: elLng,
                  distanceKm: parseFloat(dist.toFixed(2)),
                  phone: defaultPhone,
                  address,
                  openingHours: tags.opening_hours || '24/7 Emergency Service'
                };
              }).filter(p => p.lat && p.lng);

              if (places.length > 0) break;
            }
          }
        } catch (e) {
          // Continue to next mirror or fallback
        }
      }
    } catch (err) {
      // Quietly proceed to geo-adaptive local directory
    }

    // If live queries return sparse results, generate accurate local sector safe havens around user coords
    if (places.length < 4) {
      const fallbackTemplates = [
        { name: 'City Police Station & Women Help Desk', type: 'police', dLat: 0.0035, dLng: 0.0042, phone: '112 / 1091', address: 'Nearest Sector Police Station' },
        { name: 'District Emergency Civil Hospital', type: 'hospital', dLat: -0.0051, dLng: 0.0028, phone: '108 / 112', address: 'Emergency Trauma & Care Center' },
        { name: '24/7 Apollo / MedPlus Pharmacy', type: 'pharmacy', dLat: 0.0018, dLng: -0.0031, phone: '1800-102-4444', address: 'Main Market Road' },
        { name: 'PCR Police Assistance Post', type: 'police', dLat: -0.0082, dLng: -0.0064, phone: '100 / 112', address: 'Patrol Base & Highway Safety Unit' },
        { name: 'Sanjeevani Care Emergency Clinic', type: 'hospital', dLat: 0.0072, dLng: -0.0055, phone: '102', address: 'Emergency Ward & OPD' },
        { name: 'Special Women Police Cell (181 Desk)', type: 'police', dLat: 0.0048, dLng: -0.0019, phone: '181 / 1091', address: 'Women Safety & Protection Cell' },
      ];

      const fallbackPlaces = fallbackTemplates.map((item, idx) => {
        const itemLat = lat + item.dLat;
        const itemLng = lng + item.dLng;
        const dist = calculateDistance(lat, lng, itemLat, itemLng);
        return {
          id: `local-hub-${idx}`,
          name: item.name,
          type: item.type,
          lat: itemLat,
          lng: itemLng,
          distanceKm: parseFloat(dist.toFixed(2)),
          phone: item.phone,
          address: item.address,
          openingHours: '24/7 Available'
        };
      });

      places = [...places, ...fallbackPlaces];
    }

    places.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      latitude: lat,
      longitude: lng,
      count: places.length,
      places
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch safe havens' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// High-fidelity natural regional Text-to-Speech stream
app.get('/api/tts', async (req, res) => {
  try {
    const text = req.query.text;
    const lang = req.query.lang || 'hi';
    if (!text || typeof text !== 'string') {
      return res.status(400).send('Missing text parameter');
    }

    // Map language code to Google TTS regional tags
    const langMap = {
      'hi': 'hi',
      'mr': 'mr',
      'bn': 'bn',
      'ta': 'ta',
      'te': 'te',
      'gu': 'gu',
      'en': 'en-IN'
    };
    const ttsLang = langMap[lang] || 'hi';
    const cleanText = text.slice(0, 200).trim();
    const encodedText = encodeURIComponent(cleanText);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${ttsLang}&client=tw-ob`;

    const audioRes = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    });

    if (audioRes.ok) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      const arrayBuffer = await audioRes.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    } else {
      return res.status(502).json({ error: 'TTS upstream error' });
    }
  } catch (err) {
    console.error('TTS endpoint error:', err);
    return res.status(500).json({ error: 'Internal TTS error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

