# SmartCart — Automated Retail Checkout with Sensor Fusion

SmartCart is an IoT-enabled smart shopping cart that automates item detection and checkout using **sensor fusion** and cloud sync.

## Main Features
- **Automated item detection & billing** using **Raspberry Pi 4**
- **Sensor fusion (Ultrasonic + Load Cell)** to track item **additions/removals** accurately and reduce false positives
- **Barcode scanning** support for reliable item identification
- **Cloud synchronization** with **Firebase Firestore**, including **offline persistence**
- **Admin portal (React.js)** for management and real-time analytics
- **Backend API (Node.js / Express)** for application operations and integrations
- **Touchscreen cart UI (Python / Kivy)** for an in-cart user experience

## Tech Stack
- **Hardware/IoT:** Raspberry Pi 4, HC‑SR04 Ultrasonic Sensor, Load Cells, Barcode Scanner  
- **Frontend (Admin):** React.js  
- **Cart UI:** Python + Kivy  
- **Backend:** Node.js + Express  
- **Database/Cloud:** Firebase Firestore

## High-Level Architecture
- Sensors + scanner on the cart detect items and changes in cart state  
- Sensor fusion logic confirms add/remove events and updates billing  
- Data syncs to Firestore for real-time updates and persistence  
- Admin portal shows analytics and system data via Firestore / backend API

## Repository Structure
```text
backend/   # Node.js/Express API
frontend/  # React admin portal
```

## Run (Web)
### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## License
ISC
