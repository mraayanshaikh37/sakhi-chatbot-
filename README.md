🌸 Sakhi — AI-Assisted Safety Companion

«A student-developed prototype exploring how AI, mobile web technologies, and emergency-focused tools can support personal safety and everyday users.»

---

📖 About Sakhi

Sakhi is a browser-based AI safety companion designed to combine conversational assistance with practical personal-safety tools in a lightweight, mobile-first interface.

The project brings together:

- 🤖 AI-powered conversational assistance
- 🚨 Emergency SOS workflows
- 📍 Location-based safety features
- 🛡️ Journey monitoring and safety check-ins
- 🧘 Grounding and panic-support tools
- ⚖️ General safety and legal-information guidance
- 📞 Emergency and trusted-contact workflows
- 📱 Mobile-oriented interface and interaction design

Sakhi was originally developed under the working title Guardian Angel and later evolved into Sakhi as the concept, interface, and feature set expanded.

This repository contains an independently developed student prototype created for learning, experimentation, and exploring potential applications of technology in personal and civic safety.

---

🎯 Why Sakhi?

During an unsafe situation, people may need more than a single emergency button.

They may need to:

- quickly understand what to do,
- contact someone they trust,
- share their location,
- remain connected during a journey,
- find nearby safe places,
- access practical safety guidance,
- or use simple tools to attract attention.

Sakhi explores whether these functions can be brought together into one accessible interface.

The goal is not to replace emergency services, but to explore how a digital companion could potentially complement existing safety infrastructure.

---

🚨 Key Features

🤖 AI Safety Companion

Sakhi provides conversational assistance for common safety-related situations, including:

- Night travel
- Cab, auto, and taxi safety
- Situations involving stalking or following
- Emergency guidance
- General safety questions
- Grounding and panic-support guidance
- General legal and safety information

The application can also provide contextual responses through its AI conversation layer.

---

🆘 Emergency SOS

Sakhi includes an emergency workflow designed for situations where the user needs to quickly access their emergency tools.

The prototype includes:

- SOS interface
- Emergency countdown workflow
- Emergency contact integration
- Siren functionality
- Location sharing
- Device-motion based activation

The current prototype supports shake-based SOS activation, allowing the device motion to trigger the emergency interface.

---

📍 Location & Safe Havens

Sakhi can request the user's device location through the browser's Geolocation API.

The location system is used for safety-oriented functions such as:

- Current-location awareness
- Location sharing
- Nearby safety information
- Safe-haven exploration

The prototype explores the concept of helping users identify places such as police stations, hospitals, and pharmacies.

---

🛡️ Walk With Me — Ride Guard

One of Sakhi's experimental features is Walk With Me, a journey-safety concept for:

- 🚕 Cab / auto journeys
- 🚶 Walking
- 🚌 Public transportation

The prototype can:

- Start a timed journey
- Display the active journey state
- Provide periodic safety check-ins
- Allow the user to confirm that they are safe
- Share journey/location information
- Trigger an escalation workflow when a safety check-in is not confirmed

This feature explores the idea of creating a digital safety layer between a person and their trusted contacts during a journey.

---

📞 Trusted Contacts

The application includes workflows for communicating with trusted contacts during safety situations.

Depending on the device and browser, Sakhi can use system-supported communication links such as:

- SMS
- WhatsApp
- Phone communication

The prototype can include location information in emergency communication workflows.

---

📱 Additional Safety Tools

The current interface also includes experimental tools such as:

- 📞 Fake Call
- 🔦 Siren / Flash Strobe
- 🧘 Grounding exercises
- 🩹 First Aid & CPR guidance
- 🎙️ Evidence & Contacts section
- Quick-access safety prompts

These features are intended to make commonly needed safety actions accessible from one interface.

---

🧠 Engineering Concepts

Sakhi demonstrates practical implementation of several web and software-engineering concepts:

- API integration
- Conversational AI
- Prompt engineering
- JavaScript application logic
- Responsive web design
- Mobile UI/UX
- Browser APIs
- Geolocation
- Device motion detection
- Event handling
- Emergency workflow design
- Real-time response streaming
- Client-side state management
- Communication deep links

---

🛠️ Technology Stack

Technology| Purpose
HTML| User interface structure
CSS| Responsive styling and interface design
JavaScript| Application logic and interaction
Mistral API| AI-powered conversation
Geolocation API| Device location
Device Motion API| Shake-based interaction
WhatsApp / SMS Deep Links| Communication workflows
Browser APIs| Device and platform functionality

---

⚙️ How It Works

At a high level, Sakhi combines a conversational interface with browser-based safety functions.

AI Conversation

User
  ↓
Sakhi Interface
  ↓
Conversation / Safety Context
  ↓
AI API
  ↓
Response
  ↓
Sakhi Chat Interface

Emergency Workflow

User detects danger
        ↓
SOS / Emergency trigger
        ↓
Emergency interface
        ↓
Location obtained
        ↓
Trusted-contact communication
        ↓
User can contact emergency services

Walk With Me

Start Journey
      ↓
Select journey type
      ↓
Set journey duration
      ↓
Safety check-ins
      ↓
User confirms "I Am Safe"
      ↓
Journey completed

---

🔐 Privacy & Safety Considerations

Sakhi interacts with sensitive information such as location and emergency-contact information.

The current prototype is therefore intended primarily for demonstration and experimentation.

A production deployment would require additional work around:

- Secure data handling
- Authentication
- Consent management
- Data minimization
- Secure storage
- Emergency-service integration
- Abuse prevention
- False-alarm handling
- Accessibility
- Reliability and failure handling
- Legal and regulatory review
- Independent security testing

Sakhi should not be treated as a replacement for official emergency services.

In an immediate emergency, users should contact the appropriate emergency service directly.

---

🏙️ Potential Civic Applications

The project also explores how a platform like Sakhi could potentially complement existing public-safety initiatives.

Possible areas for future exploration include:

- Local safety information
- Verified public safety locations
- Local emergency resources
- Multilingual safety assistance
- Accessibility-focused safety interfaces
- Journey-safety systems
- Public awareness and safety education
- Integration with existing emergency infrastructure
- Anonymous, privacy-conscious safety analytics

These are future possibilities, not currently implemented government integrations.

---

🚧 Current Limitations

Sakhi is currently a student-developed prototype, not a production emergency-response platform.

Some capabilities depend on:

- Browser permissions
- Device capabilities
- Internet connectivity
- External APIs
- Communication applications
- Platform-specific behavior

Emergency communication also depends on the user's device, available network services, configured contacts, and external communication platforms.

The prototype has not been independently certified for emergency-response use.

---

🔄 Project Evolution

Sakhi began as a project called Guardian Angel.

The original concept focused on creating an AI-based companion for women's safety.

As development progressed, the project evolved into Sakhi, expanding the concept to include:

- AI assistance
- Emergency workflows
- Location services
- Journey monitoring
- Safety tools
- Mobile-first interaction
- Practical safety guidance

The project continues to evolve through experimentation and implementation.

---

🚀 Future Development

Potential future improvements include:

- 🎙️ Improved voice interaction
- 🌐 Multi-language support
- 📡 More robust offline capabilities
- 💬 Persistent conversation history
- 👥 Improved emergency-contact management
- 🗺️ Verified local safety resources
- ♿ Expanded accessibility
- 🔐 Stronger privacy and security architecture
- 🏙️ Exploration of civic/public-safety integration
- 🤖 Improved contextual AI responses

---

📊 Project Status

🟢 Active Development

Sakhi is currently a functional prototype under continuous development.

Features may change as the project is tested, refined, and expanded.

---

📚 What I Learned

Developing Sakhi has provided practical experience with:

- AI API integration
- Prompt engineering
- JavaScript
- Responsive web development
- Browser APIs
- Geolocation
- Device motion
- Mobile UI/UX
- Conversational interfaces
- Emergency workflow design
- Debugging and iterative development

---

👨‍💻 Author

Ayan Shaikh

Electronics & Telecommunication Engineering Student
Maharashtra, India

Interested in building practical projects involving:

- Artificial Intelligence
- Embedded Systems
- Electronics
- Web Applications
- Human-centered technology

---

📄 License

This project is currently shared for educational and learning purposes.

Please review the project implementation and dependencies before using any part of it in a production or safety-critical application.
