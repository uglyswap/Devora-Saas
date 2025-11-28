from abc import ABC, abstractmethod
from typing import Dict, Any, List
import asyncio
import logging

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    """Base class for all agents in the system"""
    
    def __init__(self, name: str, api_key: str, model: str = "openai/gpt-4o"):
        self.name = name
        self.api_key = api_key
        self.model = model
        self.memory: List[Dict[str, Any]] = []
        
    def add_to_memory(self, role: str, content: str):
        """Add a message to agent's memory"""
        self.memory.append({
            "role": role,
            "content": content
        })
        
    def get_memory(self) -> List[Dict[str, Any]]:
        """Get agent's conversation memory"""
        return self.memory
    
    def clear_memory(self):
        """Clear agent's memory"""
        self.memory = []
        
    @abstractmethod
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's main task"""
        pass
    
    async def call_llm(self, messages: List[Dict[str, str]], system_prompt: str = None) -> str:
        """Call the LLM API"""
        import httpx
        
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Devora",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": full_messages
                    },
                    timeout=120.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    logger.error(f"LLM API error: {response.status_code} - {response.text}")
                    return f"Error: {response.status_code}"
        except Exception as e:
            logger.error(f"LLM call failed: {str(e)}")
            return f"Error: {str(e)}"
