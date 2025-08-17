Map Tracking & Searching App

A React-based map application that allows real-time location tracking, searching for addresses, route planning, and displaying points of interest (POI). The project is optimized with React.memo, useMemo, and useCallback to improve performance and prevent unnecessary re-renders.

🚀 Features

🔍 Location Search – Search for specific addresses, landmarks, and businesses.

📍 Real-time Location Tracking – Show current user location on the map.

🛣 Route Planning – Display routes between two locations.

🗺 Points of Interest (POI) – Highlight important places on the map.

⚡ Performance Optimized – Uses React memoization (React.memo, useMemo, useCallback).

📲 Multi-screen Support – Works across desktop, tablet, and mobile.

📡 Geofencing Alerts – Notify users when entering/exiting specified areas.

🌦 External API Integration – Can be extended with APIs like Weather, Public Transport, etc.

🛠️ Tech Stack

React.js – Frontend library

Leaflet.js (or Google Maps API) – Map rendering

React-Leaflet – React wrapper for Leaflet

React Hooks – For state & logic management

Memoization – React.memo, useMemo, useCallback

📂 Project Setup
1. Clone the repository
git clone https://github.com/your-username/map-tracking-app.git
cd map-tracking-app

2. Install dependencies
npm install

3. Add API Key (if using Google Maps API)

Create a .env file in the root directory

REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here

4. Start the development server
npm start

📖 Usage Guide

Open the app in your browser.

Allow location access to track your current position.

Use the search bar to find addresses or POIs.

Click on a destination to get routes & directions.

Receive alerts when entering/exiting geofenced areas.

⚡ Performance Optimizations

React.memo → Prevents re-render of map components when props don’t change.

useMemo → Memoizes expensive calculations (e.g., route paths, search results).

useCallback → Memoizes functions passed as props (e.g., event handlers for map clicks).
