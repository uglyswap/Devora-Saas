from .base_agent import BaseAgent
from typing import Dict, Any, List
import json
import logging

logger = logging.getLogger(__name__)

class ReviewerAgent(BaseAgent):
    """Agent responsible for reviewing test results and deciding next actions"""
    
    def __init__(self, api_key: str, model: str = "openai/gpt-4o"):
        super().__init__("Reviewer", api_key, model)
        
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Review test results and decide on next action"""
        test_results = task.get("test_results", {})
        files = task.get("files", [])
        plan = task.get("plan", {})
        iteration = task.get("iteration", 0)
        max_iterations = task.get("max_iterations", 3)
        
        issues = test_results.get("issues", [])
        critical_issues = [i for i in issues if i.get("severity") == "critical"]
        
        # If no critical issues and we have files, consider it done
        if not critical_issues and len(files) > 0:
            logger.info("[Reviewer] No critical issues found. Code approved.")
            return {
                "success": True,
                "decision": "approve",
                "message": "Code quality is acceptable. No critical issues found.",
                "requires_iteration": False
            }
        
        # If max iterations reached, approve anyway
        if iteration >= max_iterations:
            logger.info(f"[Reviewer] Max iterations ({max_iterations}) reached. Approving current state.")
            return {
                "success": True,
                "decision": "approve",
                "message": f"Maximum iterations reached. Code has {len(critical_issues)} critical issues remaining.",
                "requires_iteration": False
            }
        
        # If there are critical issues, request iteration
        if critical_issues:
            logger.info(f"[Reviewer] Found {len(critical_issues)} critical issues. Requesting iteration.")
            
            # Use LLM to generate fix instructions
            fix_instructions = await self.generate_fix_instructions(critical_issues, files, plan)
            
            return {
                "success": True,
                "decision": "iterate",
                "message": f"Found {len(critical_issues)} critical issues that need fixing.",
                "requires_iteration": True,
                "fix_instructions": fix_instructions,
                "issues_to_fix": critical_issues
            }
        
        # Default: approve
        return {
            "success": True,
            "decision": "approve",
            "message": "Code approved.",
            "requires_iteration": False
        }
    
    async def generate_fix_instructions(self, issues: List[Dict], files: List[Dict], plan: Dict) -> str:
        """Generate instructions for fixing identified issues"""
        system_prompt = """You are an expert code reviewer providing fix instructions.
Based on the identified issues, provide clear, actionable instructions on how to fix them.
Be specific about what needs to change in which files."""
        
        issues_text = "\n".join([
            f"- [{i.get('severity')}] {i.get('file', 'unknown')}: {i.get('message', '')}"
            for i in issues
        ])
        
        message = f"""Issues Found:
{issues_text}

Current Files:
{json.dumps([f['name'] for f in files])}

Provide specific fix instructions."""
        
        response = await self.call_llm([{"role": "user", "content": message}], system_prompt)
        return response
