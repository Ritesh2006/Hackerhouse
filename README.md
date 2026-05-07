# HackerHouse SaaS Marketplace

Enterprise-grade SaaS marketplace for hiring developers, built with FastAPI, MongoDB, and React.

## 🚀 Key Features

- **Discovery**: Geo-spatial search for developers using 2dsphere indexes.
- **Hiring Flow**: Atomic creation of projects, contracts, and chat rooms.
- **Contract Management**: Status machine (Pending → Accepted → Active → Completed).
- **Real-time Chat**: Persistent messaging via WebSockets.
- **Clean Architecture**: Strictly separated layers (API → Services → Repositories → Models).

## 🛠 Tech Stack

- **Backend**: FastAPI, Motor (MongoDB), Redis (optional), JWT, Pydantic v2.
- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide React.
- **Deployment**: Docker, Docker Compose.

## 🏃‍♂️ Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env` in the `backend/` directory and fill in your details:
```bash
cp backend/.env.example backend/.env
```

### 2. Run with Docker Compose

```bash
docker-compose up --build
```
The API will be available at `http://localhost:8000` and the frontend (if configured) at its respective port.

### 3. Local Development (Manual)

#### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

Run backend tests using pytest:
```bash
cd backend
pytest
```

## 📂 Architecture

- `backend/app/api/`: Request handling and routing.
- `backend/app/services/`: Business logic and use cases.
- `backend/app/repositories/`: Data access and MongoDB queries.
- `backend/app/models/`: Database document definitions.
- `backend/app/schemas/`: API validation schemas.
- `backend/app/websockets/`: Real-time communication logic.
