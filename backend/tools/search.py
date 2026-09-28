import os
from typing import Literal
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv()

tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def web_search(
    query: str,
    max_results: int = 5,
    topic: Literal["general", "news", "finance", "sports"] = "general",
    include_raw_content: bool = False,
):
    """Real-time internet search tool using Tavily API"""
    return tavily_client.search(
        query=query,
        max_results=max_results,
        topic=topic,
        include_raw_content=include_raw_content,
    )
