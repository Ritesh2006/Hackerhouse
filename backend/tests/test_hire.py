import pytest
from app.services.hire_service import HireService
from unittest.mock import AsyncMock, MagicMock

@pytest.mark.asyncio
async def test_hire_developer_success():
    # Mock repositories
    project_repo = MagicMock()
    project_repo.create = AsyncMock(return_value="project123")
    
    contract_repo = MagicMock()
    contract_repo.create = AsyncMock(return_value="contract123")
    
    chat_repo = MagicMock()
    chat_repo.create = AsyncMock(return_value="chat123")
    
    user_repo = MagicMock()
    user_repo.get_by_id = AsyncMock(return_value={"role": "developer", "_id": "dev123"})
    
    service = HireService(project_repo, contract_repo, chat_repo, user_repo)
    
    hire_data = MagicMock()
    hire_data.developer_id = "dev123"
    hire_data.title = "Test Project"
    hire_data.description = "Test Description"
    hire_data.budget = 1000
    hire_data.deadline = "2024-12-31T00:00:00"
    
    result = await service.hire_developer("client123", hire_data)
    
    assert result["project_id"] == "project123"
    assert result["contract_id"] == "contract123"
    assert project_repo.create.called
    assert contract_repo.create.called
    assert chat_repo.create.called
