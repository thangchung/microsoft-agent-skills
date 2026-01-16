# FastAPI Router Skill

This skill provides templates and patterns for creating FastAPI routers in CoreAI DIY.

## Files

- `template.py` - Complete router template with CRUD operations

## Key Patterns

### Auth Dependencies
```python
# Optional auth - returns None if not authenticated
current_user: Optional[User] = Depends(get_current_user)

# Required auth - raises 401 if not authenticated
current_user: User = Depends(get_current_user_required)
```

### Response Models
```python
@router.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: str) -> Item:
    ...

@router.get("/items", response_model=list[Item])
async def list_items() -> list[Item]:
    ...
```

### HTTP Status Codes
```python
@router.post("/items", status_code=status.HTTP_201_CREATED)
@router.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
```

## Checklist

After creating a new router:

1. [ ] Create router in `src/backend/app/routers/`
2. [ ] Mount in `src/backend/app/main.py`
3. [ ] Create corresponding Pydantic models
4. [ ] Create service layer if needed
5. [ ] Add frontend API functions
