import os
import logging
from pydantic import BaseModel, Field
from typing import Literal
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

logger = logging.getLogger(__name__)

class TicketClassification(BaseModel):
    suggested_category: Literal['billing', 'technical', 'account', 'general'] = Field(description="Must be exactly one of: billing, technical, account, general")
    suggested_priority: Literal['low', 'medium', 'high', 'critical'] = Field(description="Must be exactly one of: low, medium, high, critical")

def classify_ticket_description(description: str) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        logger.warning("GEMINI_API_KEY not found in environment variables.")
        return {"suggested_category": "", "suggested_priority": ""}

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash", 
            google_api_key=api_key,
            temperature=0
        )
        
        parser = PydanticOutputParser(pydantic_object=TicketClassification)
        
        prompt_template = """
        You are an intelligent IT support routing system.
        Analyze the following support ticket description and determine the most appropriate category and priority.
        
        {format_instructions}
        
        Ticket Description:
        {description}
        """
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["description"],
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )
        
        chain = prompt | llm | parser
        result = chain.invoke({"description": description})
        
        category = result.suggested_category.lower() if result.suggested_category else ""
        priority = result.suggested_priority.lower() if result.suggested_priority else ""
        
        valid_categories = ["billing", "technical", "account", "general"]
        valid_priorities = ["low", "medium", "high", "critical"]
        
        if category not in valid_categories:
            category = ""
        if priority not in valid_priorities:
            priority = ""
            
        return {
            "suggested_category": category,
            "suggested_priority": priority
        }

    except Exception as e:
        logger.error(f"LangChain Classification failed: {str(e)}")
        return {
            "suggested_category": "", 
            "suggested_priority": ""
        }