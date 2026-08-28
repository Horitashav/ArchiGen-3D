# Text-to-3D Architect

Text-to-3D Architect is a full-stack application that turns natural-language architectural ideas into structured building specifications and procedural 3D model assets. The project contains a FastAPI backend and a Next.js frontend.

## What It Does

- Accepts architectural prompts such as "a compact two-story house with a flat roof".
- Uses an AI parser to convert prompts into a structured architecture specification.
- Generates a 3D asset from the specification.
- Tracks generation progress and exposes the resulting model URL.
- Supports user registration, login, JWT access and refresh tokens, and saved conversations.
- Serves generated files from the `static/` directory.

## Project Layout

```text
.
├── app/             FastAPI backend and application services
├── frontend/        Next.js web client
├── static/models/   Generated 3D model files
├── dev.db           Local SQLite database, created during development
├── requirements.txt Python dependencies
└── .env.example     Example environment configuration
```

More focused documentation is available in:

- [Backend README](app/README.md)
- [Frontend README](frontend/README.md)

## Prerequisites

- Python 3.10 or newer
- Node.js 18.18 or newer
- npm
- Credentials for the AI provider and 3D generation service used by the configured services

## Configuration

1. Copy `.env.example` to `.env`.
2. Set the required API keys and a strong `SECRET_KEY`.
3. Keep the backend and frontend API URLs aligned.

The backend defaults to `sqlite+aiosqlite:///./dev.db`. The frontend defaults to `http://localhost:8000/api/v1` when `NEXT_PUBLIC_API_URL` is not set.

## Run Locally

Start the backend from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

In a second terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The API documentation is available at `http://localhost:8000/docs`.

## Typical Workflow

1. Create an account or sign in.
2. Open the chat workspace.
3. Submit an architectural prompt.
4. The frontend polls the task endpoint while parsing and 3D generation run.
5. Review the structured specification and inspect the completed model in the detail panel.

## Development

Backend dependencies are listed in `requirements.txt`. Frontend scripts are defined in `frontend/package.json`:

```powershell
cd frontend
npm run lint
npm run build
```

The local SQLite database and generated model files are runtime data. Do not commit credentials or production secrets.
