from .base_agent import BaseAgent
from typing import Dict, Any, List
import json
import re
import logging

logger = logging.getLogger(__name__)

class CoderAgent(BaseAgent):
    """Agent responsible for generating code based on the plan"""
    
    def __init__(self, api_key: str, model: str = "openai/gpt-4o"):
        super().__init__("Coder", api_key, model)
        
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Generate code based on the execution plan"""
        plan = task.get("plan", {})
        current_files = task.get("current_files", [])
        step = task.get("step", None)
        
        system_prompt = """You are an expert full-stack developer specializing in HTML, CSS, and JavaScript.
Your role is to generate clean, production-ready code based on the execution plan.

Guidelines:
1. Generate complete, working code
2. Follow modern best practices
3. Write clean, well-commented code
4. Make the code responsive and accessible
5. Use modern ES6+ JavaScript syntax
6. Ensure proper HTML5 semantics
7. Write efficient, maintainable CSS

Format your response with clear file separators:
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

Always include filename comments."""
        
        # Build context message
        context_message = f"""Execution Plan:
{json.dumps(plan, indent=2)}

Current Files:
{json.dumps([f['name'] for f in current_files])}

"""
        
        if step:
            context_message += f"\nCurrent Step: {json.dumps(step, indent=2)}\n"
            context_message += f"\nGenerate code for this specific step."
        else:
            context_message += "\nGenerate all necessary code to implement the complete solution."
        
        messages = [{"role": "user", "content": context_message}]
        
        logger.info(f"[Coder] Generating code...")
        
        response = await self.call_llm(messages, system_prompt)
        
        # Parse code blocks from response
        files = self.parse_code_blocks(response)
        
        logger.info(f"[Coder] Generated {len(files)} file(s)")
        
        return {
            "success": True,
            "files": files,
            "raw_response": response
        }
    
    def parse_code_blocks(self, response: str) -> List[Dict[str, str]]:
        """Parse code blocks from LLM response"""
        files = []
        code_block_regex = r'```(\w+)\n?(?:\/\/\s*filename:\s*(.+)\n)?([\s\S]*?)```'
        
        matches = re.findall(code_block_regex, response)
        
        for match in matches:
            language, filename, code = match
            code = code.strip()
            
            if filename:
                filename = filename.strip()
            else:
                # Try to determine filename from language
                ext = language if language else 'txt'
                if ext == 'javascript':
                    ext = 'js'
                filename = f'file.{ext}'
            
            files.append({
                "name": filename,
                "content": code,
                "language": language or 'plaintext'
            })
        
        return files
