# Pydantic Models Skill

This skill provides templates and patterns for creating Pydantic models in CoreAI DIY.

## Files

- `template.py` - Complete multi-model pattern template

## Multi-Model Pattern

CoreAI DIY uses a multi-model pattern for Pydantic:

| Model | Purpose |
|-------|---------|
| `Base` | Common fields shared across models |
| `Create` | Request body for creation (required fields) |
| `Update` | Request body for updates (all optional) |
| `Response` | API response with all fields |
| `InDB` | Database document with `doc_type` |

## Key Patterns

### camelCase Aliases
```python
class MyModel(BaseModel):
    workspace_id: str = Field(..., alias="workspaceId")
    created_at: datetime = Field(..., alias="createdAt")
    
    class Config:
        populate_by_name = True  # Accept both snake_case and camelCase
```

### Optional Update Fields
```python
class MyUpdate(BaseModel):
    """All fields optional for PATCH requests."""
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
```

### Database Document
```python
class MyInDB(MyResponse):
    """Adds doc_type for Cosmos DB queries."""
    doc_type: str = "my_resource"
```

## Checklist

After creating new models:

1. [ ] Create models in `src/backend/app/models/`
2. [ ] Export from `src/backend/app/models/__init__.py`
3. [ ] Add corresponding TypeScript types
