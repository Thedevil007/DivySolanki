# ApplyTrack 📋
A full-stack job application tracker built with React + Python Flask + SQLite.

---

## Project Structure
```
applytrack/
├── backend/
│   ├── app.py              ← Flask API
│   └── requirements.txt    ← Python dependencies
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js          ← Main React app
        ├── index.js
        └── index.css
```

---

## Setup (Windows)

You need **two terminal windows** — one for the backend, one for the frontend.

---

### Terminal 1 — Backend (Flask)

```bash
cd applytrack/backend

# Create a virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

You should see:
```
ApplyTrack backend running on http://localhost:5000
```

The SQLite database (`applytrack.db`) is created automatically on first run.

---

### Terminal 2 — Frontend (React)

```bash
cd applytrack/frontend

# Install dependencies (first time only)
npm install

# Start the app
npm start
```

Your browser will open at **http://localhost:3000** automatically.

---

## Features

| Feature | Description |
|---|---|
| **Kanban Board** | 4 columns: Applied, Interview, Offer, Rejected |
| **Add Application** | Company, role, location, salary, status, deadline, notes, link |
| **Edit / Delete** | Click any card to edit or delete |
| **Stats Bar** | Live count per status at the top |
| **CSV Export** | Download all applications as a spreadsheet |

---

## API Endpoints (Flask)

| Method | URL | Description |
|---|---|---|
| GET | `/api/applications` | Get all applications |
| POST | `/api/applications` | Create new application |
| PUT | `/api/applications/:id` | Update application |
| DELETE | `/api/applications/:id` | Delete application |
| GET | `/api/export` | Download CSV |

---

## Tech Stack

- **Frontend**: React 18, plain CSS-in-JS
- **Backend**: Python Flask, Flask-CORS
- **Database**: SQLite (no setup needed)
- **Fonts**: DM Serif Display + DM Sans (Google Fonts)
