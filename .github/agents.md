# Copilot Agents Instructions

Instructions for GitHub Copilot coding agents working on the Bookmark Council project.

## Project Context

This is a full-stack AI-powered bookmarking application with:
- **Backend**: FastAPI (Python 3.12+) with async SQLAlchemy and Azure OpenAI
- **Frontend**: React 18 with Vite
- **Extension**: Chrome browser extension
- **Infrastructure**: Docker with docker-compose

## Quick Reference

| Component | Directory | Language | Run Command |
|-----------|-----------|----------|-------------|
| Backend | `/backend` | Python | `uv run uvicorn app.main:app --reload` |
| Frontend | `/frontend` | JavaScript | `npm run dev` |
| Tests (BE) | `/backend/tests` | Python | `uv run pytest` |
| Tests (FE) | `/frontend` | JavaScript | `npm test` |
| Docker | root | YAML | `docker-compose up -d` |

## Architecture Guidelines

### Backend Layer Responsibilities

1. **API Layer** (`app/api/`)
   - HTTP request/response handling only
   - Input validation via Pydantic
   - Route to appropriate service methods
   - Return proper HTTP status codes

2. **Service Layer** (`app/services/`)
   - All business logic lives here
   - Orchestrates repository calls
   - Handles AI integrations
   - Raises domain-specific exceptions

3. **Repository Layer** (`app/repositories/`)
   - Database operations only
   - SQLAlchemy async queries
   - No business logic

4. **Models** (`app/models/`)
   - `database.py`: SQLAlchemy ORM models
   - `schemas.py`: Pydantic request/response schemas

### Frontend Component Structure

- Each component: `ComponentName.jsx` + `ComponentName.css`
- Use hooks: `useState`, `useEffect`, `useCallback`
- API calls through `services/api.js`
- Always handle: loading, error, empty, and data states

## Coding Standards

### Python
```python
# ✅ Correct: async, typed, thin route
@router.post("/", status_code=201, response_model=BookmarkResponse)
async def create_bookmark(
    data: BookmarkCreate,
    service: BookmarkService = Depends(get_bookmark_service)
) -> BookmarkResponse:
    return await service.create(data)

# ❌ Wrong: sync, no types, business logic in route
@router.post("/")
def create_bookmark(data: dict):
    # Don't put logic here
    db.execute(...)
```

### JavaScript/React
```jsx
// ✅ Correct: functional, hooks, error handling
function BookmarkList() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getBookmarks()
      .then(setBookmarks)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  // render bookmarks...
}

// ❌ Wrong: class component, no error handling
class BookmarkList extends Component { ... }
```

## Task Execution Guidelines

### When Adding Features

1. **Understand the scope**: Read related files first
2. **Backend changes**: schemas → repository → service → api
3. **Frontend changes**: api.js → component → integrate in App.jsx
4. **Test your changes**: Run tests before completing

### When Fixing Bugs

1. **Reproduce first**: Understand the issue
2. **Find root cause**: Check all layers
3. **Fix at the right layer**: Don't patch symptoms
4. **Add test coverage**: Prevent regression

### When Refactoring

1. **Keep tests passing**: Run tests frequently
2. **Small commits**: One change at a time
3. **Maintain patterns**: Follow existing conventions

## File Modification Checklist

### New API Endpoint
- [ ] Pydantic schemas in `models/schemas.py`
- [ ] Repository method if DB access needed
- [ ] Service method with business logic
- [ ] API route with proper decorators
- [ ] Tests in `tests/test_api.py`

### New React Component
- [ ] Component file: `ComponentName.jsx`
- [ ] Styles file: `ComponentName.css`
- [ ] Loading/error/empty states
- [ ] API integration if needed
- [ ] Import in parent component

## Environment Setup

### Backend
```bash
cd backend
uv sync --dev  # Install deps
cp .env.example .env  # Configure env vars
uv run uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
npm run dev
```

## Key Dependencies

### Backend (Python)
- `fastapi` - Web framework
- `sqlalchemy[asyncio]` - Async ORM
- `pydantic` - Data validation
- `openai` - Azure OpenAI SDK
- `pytest` - Testing

### Frontend (JavaScript)
- `react` - UI framework
- `vite` - Build tool
- `axios` - HTTP client

## Important Notes

1. **Never commit** `.env` files or secrets
2. **Always use async/await** for Python I/O operations
3. **Maintain separation** between layers
4. **Handle all error states** in UI components
5. **Write descriptive commit messages**
6. **Run tests** before marking tasks complete

## Common Pitfalls to Avoid

- Don't mix sync and async code in Python
- Don't skip error handling in React components
- Don't put SQL directly in API routes
- Don't hardcode URLs or API endpoints
- Don't create class-based React components
- Don't import directly from repositories in API routes (use services)
