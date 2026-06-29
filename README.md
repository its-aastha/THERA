# THERA - AI Therapist & Mental Health Companion

## About

THERA is an AI-powered mental health web application that helps users improve their mental well-being. Users can chat with an AI therapist, track their mood, write journals, and practice breathing exercises.

---

## Features

* Secure Google Login
* AI Therapist Chat
* Mood Tracking
* Daily Journal
* Breathing Exercise
* Stress Quiz

---

## Technologies Used

**Frontend**

* React
* TypeScript
* Vite
* Tailwind CSS

**Backend**

* Express.js
* Node.js

**Database**

* Firebase Firestore

**Authentication**

* Firebase Authentication

**AI**

* Google Gemini API

---

## Installation

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=Your_API_Key
APP_URL=http://localhost:3000
```

Run the project:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Build for Production

```bash
npm run build
npm run start
```

---
##  System Architecture

```
                                  +-------------------+
                                  |    Client Web     |
                                  |    (React 19)     |
                                  +---------+---------+
                                            |
                         +------------------+------------------+
                         | HTTP Requests                       | Firebase Web Auth
                         v                                     v
             +-----------+-----------+               +---------+---------+
             |    Express Backend    |               |  Firebase Auth &  |
             |  (Secure API Proxy)   |               | Firestore DB      |
             +-----------+-----------+               +-------------------+
                         |
                         | SDK / Server-to-Server
                         v
             +-----------+-----------+
             |   Google Gemini API   |
             |  (CBT/Journal Model)  |
             +-----------------------+
```


## Security

* Secure Google Authentication
* Protected API Keys
* Firebase Security Rules
* Private User Data

---
