from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime as dt

class PuchCardBase(BaseModel):
    s_id: int
    status: int
    datetime: Optional[dt] = None

class PuchCardCreate(PuchCardBase):
    pass

class PuchCard(PuchCardBase):
    p_id: int
    
    class Config:
        orm_mode = True

class SubjectBase(BaseModel):
    name: str
    status: int = 1

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[int] = None

class Subject(SubjectBase):
    s_id: int
    puchcards: List[PuchCard] = []

    class Config:
        orm_mode = True
