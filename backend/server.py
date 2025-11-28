from fastapi import FastAPI, APIRouter, HTTPException, Body
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import httpx
import json
import base64
from github import Github

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class UserSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    openrouter_api_key: Optional[str] = None
    github_token: Optional[str] = None
    vercel_token: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSettingsUpdate(BaseModel):
    openrouter_api_key: Optional[str] = None
    github_token: Optional[str] = None
    vercel_token: Optional[str] = None

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectFile(BaseModel):
    name: str
    content: str
    language: str  # 'html', 'css', 'javascript', etc.

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    files: List[ProjectFile] = []
    conversation_id: Optional[str] = None
    github_repo_url: Optional[str] = None
    vercel_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    model: str = "gpt-4o"
    provider: str = "openai"

class GenerateCodeRequest(BaseModel):
    prompt: str
    conversation_id: Optional[str] = None
    project_id: Optional[str] = None
    model: str = "gpt-4o"
    provider: str = "openai"

class OpenRouterRequest(BaseModel):
    message: str
    model: str
    api_key: str
    conversation_history: List[Dict[str, str]] = []

class ExportGithubRequest(BaseModel):
    project_id: str
    repo_name: str
    github_token: str
    private: bool = False

class DeployVercelRequest(BaseModel):
    project_id: str
    vercel_token: str
    project_name: str

# User Settings Routes
@api_router.get("/settings", response_model=UserSettings)
async def get_settings():
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        default_settings = UserSettings()
        doc = default_settings.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.settings.insert_one(doc)
        return default_settings
    
    if isinstance(settings.get('created_at'), str):
        settings['created_at'] = datetime.fromisoformat(settings['created_at'])
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    
    return UserSettings(**settings)

@api_router.put("/settings", response_model=UserSettings)
async def update_settings(updates: UserSettingsUpdate):
    current_settings = await get_settings()
    
    update_data = updates.model_dump(exclude_unset=True)
    update_data['updated_at'] = datetime.now(timezone.utc)
    
    await db.settings.update_one(
        {"id": current_settings.id},
        {"$set": {**update_data, 'updated_at': update_data['updated_at'].isoformat()}}
    )
    
    updated_settings = await get_settings()
    return updated_settings

# Conversation Routes
@api_router.post("/conversations", response_model=Conversation)
async def create_conversation(title: str = Body(..., embed=True)):
    conversation = Conversation(title=title)
    doc = conversation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    for msg in doc['messages']:
        msg['timestamp'] = msg['timestamp'].isoformat()
    
    await db.conversations.insert_one(doc)
    return conversation

@api_router.get("/conversations", response_model=List[Conversation])
async def get_conversations():
    conversations = await db.conversations.find({}, {"_id": 0}).to_list(1000)
    
    for conv in conversations:
        if isinstance(conv.get('created_at'), str):
            conv['created_at'] = datetime.fromisoformat(conv['created_at'])
        if isinstance(conv.get('updated_at'), str):
            conv['updated_at'] = datetime.fromisoformat(conv['updated_at'])
        for msg in conv.get('messages', []):
            if isinstance(msg.get('timestamp'), str):
                msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    
    return conversations

@api_router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    conversation = await db.conversations.find_one({"id": conversation_id}, {"_id": 0})
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if isinstance(conversation.get('created_at'), str):
        conversation['created_at'] = datetime.fromisoformat(conversation['created_at'])
    if isinstance(conversation.get('updated_at'), str):
        conversation['updated_at'] = datetime.fromisoformat(conversation['updated_at'])
    for msg in conversation.get('messages', []):
        if isinstance(msg.get('timestamp'), str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    
    return Conversation(**conversation)

@api_router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    result = await db.conversations.delete_one({"id": conversation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted successfully"}

# Project Routes
@api_router.post("/projects", response_model=Project)
async def create_project(project: Project):
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.projects.insert_one(doc)
    return project

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    
    for proj in projects:
        if isinstance(proj.get('created_at'), str):
            proj['created_at'] = datetime.fromisoformat(proj['created_at'])
        if isinstance(proj.get('updated_at'), str):
            proj['updated_at'] = datetime.fromisoformat(proj['updated_at'])
    
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if isinstance(project.get('created_at'), str):
        project['created_at'] = datetime.fromisoformat(project['created_at'])
    if isinstance(project.get('updated_at'), str):
        project['updated_at'] = datetime.fromisoformat(project['updated_at'])
    
    return Project(**project)

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project: Project):
    project.updated_at = datetime.now(timezone.utc)
    doc = project.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": doc}
    )
    
    return project

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

# OpenRouter Models List
@api_router.get("/openrouter/models")
async def get_openrouter_models(api_key: str):
    """Get available models from OpenRouter"""
    if not api_key or not api_key.strip():
        raise HTTPException(status_code=422, detail="API key is required")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://openrouter.ai/api/v1/models",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Lovable Clone"
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch models")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Code Generation with OpenRouter
@api_router.post("/generate/openrouter")
async def generate_with_openrouter(request: OpenRouterRequest):
    """Generate code using OpenRouter API"""
    try:
        system_prompt = """You are an expert full-stack developer. Generate clean, production-ready code based on user requirements.
        
When generating code:
        1. For single files, provide complete, working code
        2. For multi-file projects, structure them clearly with file names
        3. Include HTML, CSS, and JavaScript as needed
        4. Use modern best practices
        5. Make the code responsive and accessible
        6. Add helpful comments
        
        Format your response with clear file separators like:
        ```html
        // filename: index.html
        [code here]
        ```
        
        ```css
        // filename: styles.css
        [code here]
        ```
        
        ```javascript
        // filename: script.js
        [code here]
        ```
        """
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history
        messages.extend(request.conversation_history)
        
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {request.api_key}",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Lovable Clone",
                    "Content-Type": "application/json"
                },
                json={
                    "model": request.model,
                    "messages": messages
                },
                timeout=120.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "response": result["choices"][0]["message"]["content"],
                    "model": request.model
                }
            else:
                raise HTTPException(status_code=response.status_code, detail=response.text)
    except Exception as e:
        logging.error(f"OpenRouter generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# GitHub Export
@api_router.post("/github/export")
async def export_to_github(request: ExportGithubRequest):
    """Export project to GitHub repository"""
    try:
        # Get project
        project = await get_project(request.project_id)
        
        if not project.files:
            raise HTTPException(status_code=400, detail="Project has no files to export")
        
        # Create GitHub client
        g = Github(request.github_token)
        user = g.get_user()
        
        # Create repository
        try:
            repo = user.create_repo(
                name=request.repo_name,
                description=project.description or "Created with Lovable Clone",
                private=request.private,
                auto_init=True
            )
        except Exception as e:
            if "already exists" in str(e).lower():
                raise HTTPException(status_code=400, detail=f"Repository '{request.repo_name}' already exists")
            raise
        
        # Add files to repository
        for file in project.files:
            try:
                repo.create_file(
                    path=file.name,
                    message=f"Add {file.name}",
                    content=file.content
                )
            except Exception as e:
                logging.error(f"Error creating file {file.name}: {str(e)}")
        
        # Update project with GitHub URL
        project.github_repo_url = repo.html_url
        await update_project(request.project_id, project)
        
        return {
            "success": True,
            "repo_url": repo.html_url,
            "message": f"Project exported to GitHub successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"GitHub export error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Vercel Deploy
@api_router.post("/vercel/deploy")
async def deploy_to_vercel(request: DeployVercelRequest):
    """Deploy project to Vercel"""
    try:
        # Get project
        project = await get_project(request.project_id)
        
        if not project.files:
            raise HTTPException(status_code=400, detail="Project has no files to deploy")
        
        # Prepare files for Vercel
        files = []
        for file in project.files:
            files.append({
                "file": file.name,
                "data": base64.b64encode(file.content.encode()).decode()
            })
        
        # Deploy to Vercel
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.vercel.com/v13/deployments",
                headers={
                    "Authorization": f"Bearer {request.vercel_token}",
                    "Content-Type": "application/json"
                },
                json={
                    "name": request.project_name,
                    "files": files,
                    "projectSettings": {
                        "framework": None
                    }
                },
                timeout=120.0
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                deployment_url = f"https://{result.get('url', '')}"
                
                # Update project with Vercel URL
                project.vercel_url = deployment_url
                await update_project(request.project_id, project)
                
                return {
                    "success": True,
                    "url": deployment_url,
                    "message": "Project deployed to Vercel successfully"
                }
            else:
                raise HTTPException(status_code=response.status_code, detail=response.text)
                
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Vercel deployment error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@api_router.get("/")
async def root():
    return {"message": "Lovable Clone API", "status": "running"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()