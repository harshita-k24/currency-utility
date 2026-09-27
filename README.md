# Real-Time Currency Utility & Historical Trend Visualizer

A clean, fast full-stack utility for real-time currency conversion, historical trend visualization, and travel budgeting.

## Core Principles
- **Server-Side Computations:** All currency calculations, conversions, and travel matrices are processed exclusively on the Express backend; the React frontend handles only presentation.
- **Data Persistence:** SQLite stores user favorites and conversion logs.
- **Live Exchange Rates:** Cached in-memory to prevent rate-limiting.

## Key Features
- Dual Currency Converter with bidirectional swap and favorites bookmarking.
- 30-Day Historical Trend Line Graph (Chart.js).
- Travel Budgeting Mode: Simultaneous base amount conversion into 5 major currencies (EUR, GBP, JPY, CAD, AUD).

## Running the Project
- **Backend:** `cd server && npm install && node index.js` (Runs on http://localhost:5000)
- **Frontend:** `cd client && npm install && npm run dev` (Runs on http://localhost:5173)
