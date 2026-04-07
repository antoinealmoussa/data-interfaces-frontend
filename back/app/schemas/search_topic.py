from pydantic import BaseModel

class SearchTopicResponse(BaseModel):
    text: str
