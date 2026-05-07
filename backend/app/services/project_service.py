from app.repositories.project_repo import ProjectRepository

class ProjectService:
    def __init__(self, project_repo: ProjectRepository):
        self.project_repo = project_repo

    async def get_my_projects(self, user_id: str, role: str):
        return await self.project_repo.get_by_user(user_id, role)

    async def get_project(self, project_id: str):
        return await self.project_repo.get_by_id(project_id)
