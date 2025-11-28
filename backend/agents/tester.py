from .base_agent import BaseAgent
from typing import Dict, Any, List
import logging
import re

logger = logging.getLogger(__name__)

class TesterAgent(BaseAgent):
    """Agent responsible for testing generated code"""
    
    def __init__(self, api_key: str, model: str = "openai/gpt-4o"):
        super().__init__("Tester", api_key, model)
        
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Test the generated code"""
        files = task.get("files", [])
        plan = task.get("plan", {})
        
        # Perform static analysis
        static_analysis = self.static_analysis(files)
        
        # Use LLM to review code quality
        llm_review = await self.llm_code_review(files, plan)
        
        # Combine results
        issues = static_analysis["issues"] + llm_review.get("issues", [])
        
        test_passed = len([i for i in issues if i.get("severity") == "critical"]) == 0
        
        logger.info(f"[Tester] Test completed - Passed: {test_passed}, Issues: {len(issues)}")
        
        return {
            "success": True,
            "test_passed": test_passed,
            "issues": issues,
            "static_analysis": static_analysis,
            "llm_review": llm_review
        }
    
    def static_analysis(self, files: List[Dict[str, str]]) -> Dict[str, Any]:
        """Perform static analysis on code"""
        issues = []
        
        for file in files:
            content = file.get("content", "")
            filename = file.get("name", "")
            language = file.get("language", "")
            
            # Basic HTML validation
            if language == "html":
                if "<!DOCTYPE html>" not in content:
                    issues.append({
                        "file": filename,
                        "severity": "warning",
                        "message": "Missing DOCTYPE declaration"
                    })
                if "<html" not in content:
                    issues.append({
                        "file": filename,
                        "severity": "critical",
                        "message": "Missing <html> tag"
                    })
                if "<body" not in content and "<head" not in content:
                    issues.append({
                        "file": filename,
                        "severity": "warning",
                        "message": "Missing <head> or <body> tags"
                    })
            
            # Basic JavaScript validation
            if language == "javascript" or language == "js":
                # Check for common syntax issues
                if content.count("{") != content.count("}"):
                    issues.append({
                        "file": filename,
                        "severity": "critical",
                        "message": "Mismatched curly braces"
                    })
                if content.count("(") != content.count(")"):
                    issues.append({
                        "file": filename,
                        "severity": "critical",
                        "message": "Mismatched parentheses"
                    })
                    
            # Check for empty files
            if not content.strip():
                issues.append({
                    "file": filename,
                    "severity": "warning",
                    "message": "File is empty"
                })
        
        return {
            "files_analyzed": len(files),
            "issues": issues
        }
    
    async def llm_code_review(self, files: List[Dict[str, str]], plan: Dict[str, Any]) -> Dict[str, Any]:
        """Use LLM to review code quality"""
        system_prompt = """You are an expert code reviewer.
Analyze the provided code and identify:
1. Potential bugs or errors
2. Code quality issues
3. Missing functionality based on the plan
4. Security concerns
5. Performance issues
6. Best practice violations

Return your review in JSON format:
{
  "overall_quality": "good|fair|poor",
  "issues": [
    {
      "file": "filename",
      "severity": "critical|warning|info",
      "message": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "suggestions": ["General improvement suggestion 1", "..."]
}"""
        
        files_content = "\n\n".join([
            f"File: {f['name']}\n```{f.get('language', '')}\n{f['content']}\n```"
            for f in files
        ])
        
        message = f"""Plan:
{plan.get('analysis', 'No plan provided')}

Generated Code:
{files_content}

Please review this code."""
        
        try:
            response = await self.call_llm([{"role": "user", "content": message}], system_prompt)
            
            # Try to parse JSON
            import json
            review = json.loads(response)
            return review
        except:
            return {
                "overall_quality": "unknown",
                "issues": [],
                "suggestions": [],
                "raw_review": response
            }
