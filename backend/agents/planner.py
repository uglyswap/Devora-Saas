from .base_agent import BaseAgent
from typing import Dict, Any
import json
import logging

logger = logging.getLogger(__name__)

class PlannerAgent(BaseAgent):
    """Agent responsible for analyzing requirements and creating execution plans"""
    
    def __init__(self, api_key: str, model: str = "openai/gpt-4o"):
        super().__init__("Planner", api_key, model)
        
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Create a detailed execution plan from user requirements"""
        user_request = task.get("request", "")
        context = task.get("context", {})
        
        system_prompt = """You are an expert software architect and planner.
Your role is to analyze user requirements and create a detailed, step-by-step execution plan.

For each user request, you must:
1. Analyze the requirements thoroughly
2. Break down the task into logical steps
3. Identify the files that need to be created or modified
4. Specify the technologies and approaches to use
5. Consider edge cases and potential issues

Return your plan in the following JSON format:
{
  "analysis": "Brief analysis of the requirements",
  "steps": [
    {
      "step_number": 1,
      "title": "Step title",
      "description": "What needs to be done",
      "files": ["file1.html", "file2.css"],
      "approach": "Technical approach to use"
    }
  ],
  "files_to_create": [
    {
      "name": "index.html",
      "purpose": "Main HTML structure",
      "language": "html"
    }
  ],
  "considerations": ["Edge case 1", "Edge case 2"]
}

Be thorough and specific."""
        
        messages = [
            {"role": "user", "content": f"User Request: {user_request}\n\nContext: {json.dumps(context)}"}
        ]
        
        logger.info(f"[Planner] Creating execution plan for: {user_request[:100]}...")
        
        response = await self.call_llm(messages, system_prompt)
        
        try:
            # Try to parse JSON response
            plan = json.loads(response)
            logger.info(f"[Planner] Plan created with {len(plan.get('steps', []))} steps")
            return {
                "success": True,
                "plan": plan,
                "raw_response": response
            }
        except json.JSONDecodeError:
            # If not valid JSON, return as text plan
            logger.warning("[Planner] Response not in JSON format, returning as text")
            return {
                "success": True,
                "plan": {
                    "analysis": response,
                    "steps": [],
                    "files_to_create": [],
                    "considerations": []
                },
                "raw_response": response
            }
