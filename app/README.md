# Backend API

This directory contains the FastAPI backend for Text-to-3D Architect. It handles authentication, conversations, prompt parsing, 3D generation, task persistence, and static model delivery.

## Run the API

Run these commands from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The service is then available at `http://localhost:8000`.

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Versioned API prefix: `http://localhost:8000/api/v1`
- Generated files: `http://localhost:8000/static/...`

## Configuration

Settings are loaded from `.env` by `app.config.Settings`. Important settings include:

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_NAME` | `ArchSynth 3D` | FastAPI application name |
| `APP_VERSION` | `0.1.0` | API version shown in the docs |
| `DATABASE_URL` | `sqlite+aiosqlite:///./dev.db` | Async SQLAlchemy database URL |
| `GROQ_API_KEY` | empty | AI prompt parsing credential |
| `GROQ_MODEL_NAME` | `llama3-70b-8192` | AI model used by the parser |
| `SECRET_KEY` | development placeholder | JWT signing secret; replace in real deployments |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime |

The repository also includes integration-specific variables in `.env.example`. Keep the values used by the active service implementations consistent with the settings and service code.

## API Routes

All routes below are under `/api/v1`.

### System

- `GET /health` checks service availability.

### Authentication

- `POST /auth/register` creates a user account.
- `POST /auth/login` returns access and refresh tokens.
- `POST /auth/refresh?refresh_token=...` refreshes an access token.
- `GET /auth/me` returns the authenticated user.

Protected routes use the header:

```text
Authorization: Bearer <access-token>
```

### Architecture and Generation

- `POST /architecture/parse-only` converts a prompt into an `ArchitectureSpec` without generating a model.
- `POST /architecture/generate` parses a prompt, generates a model, and returns its task result.
- `GET /architecture/tasks/{task_id}` returns task status, specification, errors, and model URL.
- `GET /architecture/tasks?limit=10` lists recent generation tasks.

Generation status values include `parsing`, `generating_3d`, `completed`, and `failed`.

Example request:

```json
{
  "prompt": "A modern two-story house with a flat roof and a small courtyard"
}
```

### Conversations

- `GET /conversations` lists conversations belonging to the current user.
- `GET /conversations/{conversation_id}/messages` returns messages after verifying ownership.

## Application Structure

```text
app/
├── main.py                 FastAPI application factory and lifespan
├── config.py               Environment-backed settings
├── api/v1/endpoints/       Route handlers
├── core/                   Security and exception handling
├── db/                     Async SQLAlchemy session and models
├── schemas/                Pydantic request and response schemas
├── services/parser.py      Natural-language architecture parsing
├── services/generator_3d.py 3D asset generation client
├── services/storage.py     File storage helpers
├── middlewares/            Logging and rate-limiting middleware
└── workers/                Celery configuration and task definitions
```

On startup, the lifespan handler creates missing SQLite tables. The backend currently performs the generation flow through the API request and persists task state in the database.

## Production Notes

- Set a strong, unique `SECRET_KEY`.
- Restrict CORS origins instead of using the development-wide-open configuration.
- Use a managed database and durable storage for generated models.
- Store API keys outside source control.
- Configure a real worker and broker when generation needs to run asynchronously at scale.
