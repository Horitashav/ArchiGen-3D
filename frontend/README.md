# Frontend

This directory contains the Next.js client for Text-to-3D Architect. It provides authentication screens, the conversational architecture workspace, generation progress, structured specification details, and a 3D model viewer.

## Requirements

- Node.js 18.18 or newer
- npm
- The backend API running locally or an accessible deployed API

## Configuration

Create `frontend/.env.local` when the backend is not using its default URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

The default in `src/lib/api.ts` is `http://localhost:8000/api/v1`. Keep `/api/v1` in the value. The client derives the backend origin from this URL when loading generated model files.

## Run Locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. The root route redirects to `/chat`; unauthenticated users are redirected to `/login`.

## Available Scripts

```powershell
npm run dev      # Start the development server
npm run lint     # Run ESLint
npm run build    # Create a production build
npm run start    # Serve the production build
```

## Main Routes

- `/login` signs in an existing user.
- `/register` creates a new user account.
- `/chat` provides the authenticated architecture generation workspace.

## Client Structure

```text
src/
├── app/                  Next.js routes and global styles
├── components/auth/      User account controls
├── components/chat/      Sidebar, messages, prompt bar, and detail panel
├── components/generator/ Model viewer, specification, and status UI
├── components/layout/    Shared application header
├── components/ui/        Reusable buttons, cards, badges, and spinners
├── contexts/             Authentication state
├── hooks/                Generation-related hooks
├── lib/api.ts            Backend request client
└── types/                Shared TypeScript models
```

## Generation Flow

1. The user submits a prompt from the chat workspace.
2. The client sends it to `POST /api/v1/architecture/generate`.
3. The returned task ID is polled every three seconds.
4. Status, architecture data, errors, and the generated model URL are displayed as the task changes.
5. Conversations and messages are loaded through the authenticated conversation endpoints.

## Backend Dependency

Start the backend from the repository root before using generation or authentication:

```powershell
uvicorn app.main:app --reload --port 8000
```

See the [backend README](../app/README.md) for API and environment details. See the [project README](../README.md) for full-stack setup.
