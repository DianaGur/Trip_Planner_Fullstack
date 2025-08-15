
# Trip Planner (Web) — Smart Itinerary Builder 🌍🗺️

A full‑stack web app that helps users generate city trips with points of interest, routes, maps, weather, and personal trip history.  
Built with **React** (frontend) and **Node.js/Express + MongoDB** (backend) with **JWT** authentication.

> **Note on declared limitations** (for transparency and grading):  
> • Without real API keys (GROQ / OPENROUTE / MAPBOX / OPENWEATHER / PIXABAY) some features run in **demo** mode.  
> • `/api/trips` and `/api/images` are **JWT‑protected**; unauthenticated requests return **401**.  
> • No `docker-compose` or automated tests yet (run client & server separately).  
> • Leaflet map icons are loaded from a CDN; **offline** usage requires hosting icons locally.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Model (Trip)](#data-model-trip)
- [Security & Rate Limiting](#security--rate-limiting)
- [Project Structure](#project-structure)
- [Development Tips](#development-tips)
- [Known Issues](#known-issues)
- [Future Work](#future-work)
- [License](#license)

---

## Features
- ✨ **AI‑assisted trip generation** (city, trip type, days) with balanced points of interest (POIs).  
- 🗺️ **Interactive map** using Leaflet: route polyline, POI markers, popups and descriptions.  
- 🌦️ **Weather forecast** (OpenWeather) for the generated trip region.  
- 🖼️ **Location cover image** (Pixabay) using AI‑inferred keywords.  
- 👤 **User accounts**: register, login (JWT), update profile, change password.  
- 💾 **Save trips & history** per user with stats.  
- 🚦 **Basic rate limiting** on sensitive endpoints.

---

## Architecture
**Frontend (client):** React, React‑Bootstrap, Leaflet, Axios  
**Backend (server):** Express, Mongoose/MongoDB, JWT, dotenv, bcryptjs, axios  
**External services (optional):** Groq (POI suggestions), OpenRoute/Mapbox (routing), OpenWeather (forecast), Pixabay (images)

**High‑level flow:**  
User fills *city / tripType / days* → (optional) AI proposes balanced POIs → (optional) OpenRoute/Mapbox builds routes → OpenWeather adds forecast → Pixabay fetches a cover image → user saves the trip to MongoDB.

---

## Quick Start
### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- (Optional) API keys if you want **real** routes, weather, and images

### Backend
```bash
cd server
npm install
npm run dev         # nodemon server.js (default PORT=5000)
```
Create `server/.env` (see below).

### Frontend
```bash
cd client
npm install
npm start           # React dev server on http://localhost:3000
```

> Ensure `CLIENT_URL` in your backend `.env` matches your frontend origin; CORS is enabled on the server.

---

## Environment Variables
Create `server/.env` with at least:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>
JWT_SECRET=change_me
CLIENT_URL=http://localhost:3000
PORT=5000
```
Optional (enables real integrations; otherwise **demo/mocks** are used):
```
GROQ_API_KEY=...
OPENROUTE_API_KEY=...
MAPBOX_API_KEY=...
OPENWEATHER_API_KEY=...
PIXABAY_API_KEY=...
```

---

## API Reference
### Auth (`/api/auth`)
| Method | Path            | Auth | Description                |
|-------:|-----------------|:----:|----------------------------|
| POST   | `/register`     |  —   | Register a new user        |
| POST   | `/login`        |  —   | Login and receive a JWT    |
| GET    | `/me`           | JWT  | Get current user profile   |
| PUT    | `/me`           | JWT  | Update profile             |
| PUT    | `/password`     | JWT  | Change password            |
| POST   | `/logout`       | JWT  | Logout (if implemented)    |

### Trips (`/api/trips`)
| Method | Path                 | Auth | Description                           |
|-------:|----------------------|:----:|---------------------------------------|
| POST   | `/generate`          | JWT  | Generate a new trip (AI + routing)    |
| GET    | `/stats`             | JWT  | User trip statistics                  |
| GET    | `/`                  | JWT  | List current user's trips             |
| POST   | `/`                  | JWT  | Save a trip                           |
| GET    | `/:id`               | JWT  | Get a trip by id                      |
| PUT    | `/:id`               | JWT  | Update a trip                         |
| DELETE | `/:id`               | JWT  | Delete a trip                         |

### Images (`/api/images`)
| Method | Path                                         | Auth | Description                     |
|-------:|----------------------------------------------|:----:|---------------------------------|
| GET    | `/location/:city/:country?`                  | JWT  | Get a representative cover image|

**Auth header:** `Authorization: Bearer <JWT>`

---

## Data Model (Trip)
The `Trip` document (Mongoose) includes:
- **meta**: `city`, `tripType` (`hiking`, `cycling`, `driving`, `walking`, …), `days`
- **pointsOfInterest[]**: `name`, `description`, `coordinates {{lat,lng}}`, `estimatedVisitMinutes`
- **startPoint / endPoint**: `{{ name, coordinates {{ lat, lng }} }}`
- **route**: `{{ geometry: {{ type: 'LineString', coordinates: [[lng,lat], ...] }}, distanceKm, durationMinutes }}`
- **weather[]**: daily aggregates (avg/min/max temp, humidity, wind, description, icon) when available
- **coverImage**: url & metadata when available
- **owner**: user reference

---

## Security & Rate Limiting
- **JWT** auth middleware (`protect`) guards most trip and image routes.  
- **CORS** is controlled via `CLIENT_URL`.  

---

## Project Structure
```
Trip_Planner_FP_WEB/
├─ server/
│  ├─ controllers/       # auth, trips, images
│  ├─ models/            # Mongoose schemas (User, Trip)
│  ├─ routes/            # /api/auth, /api/trips, /api/images
│  ├─ services/          # aiService, routingService, weatherService, imageSearchService
│  ├─ middleware/        # auth
│  └─ server.js
└─ client/
   └─ src/
      ├─ pages/          # PlanTrip, TripView, TripHistory, Dashboard, Weather
      ├─ components/     # Map/RouteMap, Auth, Layout/Navbar, DebugPanel
      ├─ context/        # AuthContext
      └─ services/       # api.js
```

---

## Development Tips
- **Leaflet icons:** loaded from CDN in the client; for offline usage, host the icon assets locally and update paths.  
- **Routing:** `services/routingService.js` can switch between real OpenRoute/Mapbox and demo routes depending on keys.  
- **Images:** `imageSearchService` prefers Pixabay; add alternatives if required by licensing.  
- **Testing:** add unit tests for services (AI/route/weather/image), API tests with `supertest`, and UI tests with React Testing Library.

---

## Known Issues
- Rouut creating still need a minor improvment.
- User stays loggef in when the server is shut down. 
- Cities and interest points can be retirived from AI in the native langauge.   

---

## Future Work
- ✅ Add **unit/API/UI tests** and **CI**.  
- ✅ Provide **Dockerfiles** and `docker-compose` (including MongoDB).  
- ✅ Fully integrate OpenRoute/Mapbox + OpenWeather with robust fallbacks.  
- ✅ Improve map UX (route editing, waypoint re‑ordering, POI categories/filters).

---
—  
_Last updated: 2025-08-14_
