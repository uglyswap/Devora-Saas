from .planner import PlannerAgent
from .coder import CoderAgent
from .tester import TesterAgent
from .reviewer import ReviewerAgent
from typing import Dict, Any, List, Callable
import asyncio
import logging

logger = logging.getLogger(__name__)

class OrchestratorAgent:
    """Main orchestrator that coordinates all agents"""
    
    def __init__(self, api_key: str, model: str = "openai/gpt-4o"):
        self.api_key = api_key
        self.model = model
        
        # Initialize all agents
        self.planner = PlannerAgent(api_key, model)
        self.coder = CoderAgent(api_key, model)
        self.tester = TesterAgent(api_key, model)
        self.reviewer = ReviewerAgent(api_key, model)
        
        self.max_iterations = 3
        self.progress_callback: Callable = None
        
    def set_progress_callback(self, callback: Callable):
        """Set callback for progress updates"""
        self.progress_callback = callback
        
    async def emit_progress(self, event: str, data: Dict[str, Any]):
        """Emit progress event"""
        if self.progress_callback:
            await self.progress_callback(event, data)
        logger.info(f"[Orchestrator] {event}: {data.get('message', '')}")
    
    async def execute(self, user_request: str, current_files: List[Dict] = None) -> Dict[str, Any]:
        """Execute the agentic workflow"""
        if current_files is None:
            current_files = []
        
        logger.info(f"[Orchestrator] Starting agentic workflow for request: {user_request[:100]}...")
        
        iteration = 0
        final_files = []
        
        try:
            # Step 1: Planning
            await self.emit_progress("planning", {"message": "Analyzing requirements and creating plan..."})
            
            plan_result = await self.planner.execute({
                "request": user_request,
                "context": {"current_files": [f['name'] for f in current_files]}
            })
            
            if not plan_result["success"]:
                return {"success": False, "error": "Planning failed"}
            
            plan = plan_result["plan"]
            await self.emit_progress("plan_complete", {
                "message": f"Plan created with {len(plan.get('steps', []))} steps",
                "plan": plan
            })
            
            # Iterative loop: Code → Test → Review → Fix (if needed)
            while iteration < self.max_iterations:
                iteration += 1
                
                await self.emit_progress("iteration_start", {
                    "message": f"Starting iteration {iteration}/{self.max_iterations}",
                    "iteration": iteration
                })
                
                # Step 2: Code Generation
                await self.emit_progress("coding", {"message": "Generating code..."})
                
                code_result = await self.coder.execute({
                    "plan": plan,
                    "current_files": current_files,
                    "iteration": iteration
                })
                
                if not code_result["success"]:
                    return {"success": False, "error": "Code generation failed"}
                
                final_files = code_result["files"]
                await self.emit_progress("code_complete", {
                    "message": f"Generated {len(final_files)} file(s)",
                    "files": [f['name'] for f in final_files]
                })
                
                # Step 3: Testing
                await self.emit_progress("testing", {"message": "Testing generated code..."})
                
                test_result = await self.tester.execute({
                    "files": final_files,
                    "plan": plan
                })
                
                await self.emit_progress("test_complete", {
                    "message": f"Tests completed - {len(test_result['issues'])} issue(s) found",
                    "test_passed": test_result["test_passed"],
                    "issues": test_result["issues"]
                })
                
                # Step 4: Review
                await self.emit_progress("reviewing", {"message": "Reviewing results..."})
                
                review_result = await self.reviewer.execute({
                    "test_results": test_result,
                    "files": final_files,
                    "plan": plan,
                    "iteration": iteration,
                    "max_iterations": self.max_iterations
                })
                
                await self.emit_progress("review_complete", {
                    "message": review_result["message"],
                    "decision": review_result["decision"],
                    "requires_iteration": review_result["requires_iteration"]
                })
                
                # Check if we should iterate
                if not review_result["requires_iteration"]:
                    await self.emit_progress("complete", {
                        "message": "Agentic workflow completed successfully!",
                        "iterations": iteration
                    })
                    break
                
                # If iteration needed, update the plan with fix instructions
                if review_result.get("fix_instructions"):
                    await self.emit_progress("fixing", {
                        "message": "Applying fixes based on review...",
                        "instructions": review_result["fix_instructions"]
                    })
                    
                    # Update plan with fix instructions for next iteration
                    plan["fix_instructions"] = review_result["fix_instructions"]
                    plan["issues_to_fix"] = review_result.get("issues_to_fix", [])
            
            # Final result
            return {
                "success": True,
                "files": final_files,
                "plan": plan,
                "iterations": iteration,
                "message": f"Completed in {iteration} iteration(s)"
            }
            
        except Exception as e:
            logger.error(f"[Orchestrator] Error: {str(e)}")
            await self.emit_progress("error", {
                "message": f"Error: {str(e)}"
            })
            return {
                "success": False,
                "error": str(e)
            }
