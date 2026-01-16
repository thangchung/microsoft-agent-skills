# Copilot Instructions for Bookmark Council

## Project Overview

Bookmark Council is an AI-powered bookmarking application that transforms saved links into actionable insights. It includes:
- **Backend**: Python FastAPI with SQLAlchemy, async/await patterns, and Azure OpenAI integration
- **Frontend**: React 18 with Vite build system
- **Browser Extension**: Chrome extension for quick bookmark saves
- **Docker**: Container orchestration with docker-compose

## Architecture

This project follows **clean architecture** principles with clear separation of concerns:

```
backend/
├── app/
│   ├── api/           # API endpoints (controllers) - HTTP layer only
│   ├── services/      # Business logic layer
│   ├── repositories/  # Data access layer (database operations)
│   ├── models/        # Data models (SQLAlchemy) and schemas (Pydantic)
│   └── config/        # Configuration and settings

frontend/
├── src/
│   ├── components/    # React components with co-located CSS
│   ├── services/      # API client services (Axios)
│   └── assets/        # Static assets
```

## Code Style Guidelines

### Python (Backend)

- Use **Python 3.12+** features
- Follow **PEP 8** style guidelines
- Use **async/await** for all database and AI operations
- Use **type hints** for all function parameters and return values
- Use **Pydantic** models for request/response validation
- Keep API routes thin - delegate business logic to services
- Use dependency injection for repositories and services
- Handle errors with descriptive HTTP exceptions

Example pattern:
```python
# api/bookmarks.py - Keep thin, delegate to service
@router.get("/{bookmark_id}")
async def get_bookmark(bookmark_id: int, service: BookmarkService = Depends()):
    return await service.get_bookmark(bookmark_id)

# services/bookmark_service.py - Business logic here
async def get_bookmark(self, bookmark_id: int) -> Bookmark:
    bookmark = await self.repository.get_by_id(bookmark_id)
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return bookmark
```

### JavaScript/React (Frontend)

- Use **React 18** functional components with hooks
- Use **ES6+** syntax (arrow functions, destructuring, template literals)
- Co-locate CSS files with components (ComponentName.jsx + ComponentName.css)
- Use **Axios** for API calls via the services/api.js module
- Prefer controlled components for forms
- Handle loading and error states in components

Example pattern:
```jsx
// Component with loading/error handling
const [bookmarks, setBookmarks] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  api.getBookmarks()
    .then(setBookmarks)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

## AI Integration

- Uses **Azure OpenAI** with the Responses API
- AI features include summarization, recommendations, and web search grounding
- **Audio Narratives** use `gpt-realtime-mini` model via WebSocket Realtime API for real audio generation
- AI service is in `backend/app/services/ai_service.py`
- Environment variables for Azure OpenAI:
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_OPENAI_DEPLOYMENT`
- Environment variables for Realtime Audio:
  - `AZURE_OPENAI_AUDIO_API_KEY`
  - `AZURE_OPENAI_AUDIO_ENDPOINT` (base URL without /openai/v1)
  - `AZURE_OPENAI_AUDIO_DEPLOYMENT` (default: `gpt-realtime-mini`)

## Testing

### Backend
- Use **pytest** with async support
- Tests are in `backend/tests/`
- Use fixtures from `conftest.py`
- Run: `uv run pytest` or `pytest`

### Frontend
- Component tests with Vite/Vitest
- Run: `npm test`

## Environment Variables

### Backend (.env)
```env
# Primary Azure OpenAI (Responses API)
AZURE_OPENAI_API_KEY=your_key
AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/openai/v1/
AZURE_OPENAI_DEPLOYMENT=gpt-5-nano

# Realtime API (gpt-realtime-mini for audio narratives)
AZURE_OPENAI_AUDIO_API_KEY=your_realtime_key
AZURE_OPENAI_AUDIO_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_OPENAI_AUDIO_DEPLOYMENT=gpt-realtime-mini

DATABASE_URL=sqlite+aiosqlite:///./bookmarks.db
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Common Tasks

### Adding a new API endpoint
1. Define Pydantic schemas in `models/schemas.py`
2. Add repository method in `repositories/`
3. Add service method in `services/`
4. Create route in `api/` with proper HTTP methods and status codes

### Adding a new React component
1. Create `ComponentName.jsx` in `src/components/`
2. Create `ComponentName.css` alongside it
3. Import and use API services from `services/api.js`
4. Handle loading, error, and empty states

### Running locally
- Backend: `cd backend && uv run uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm run dev`
- Docker: `docker-compose up -d`

## Do's and Don'ts

### Do
- ✅ Follow the existing architectural patterns
- ✅ Use async/await for all I/O operations in Python
- ✅ Add proper error handling with meaningful messages
- ✅ Write type hints for Python functions
- ✅ Keep components focused and single-purpose
- ✅ Use environment variables for configuration

### Don't
- ❌ Put business logic in API route handlers
- ❌ Make direct database calls from API routes
- ❌ Store secrets in code or commit .env files
- ❌ Create class-based React components (use functional)
- ❌ Ignore error states in UI components
