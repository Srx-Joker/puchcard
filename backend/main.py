from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
import uvicorn

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 允许跨域请求，方便前端开发
origins = [
    "http://localhost:4200",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/subjects/", response_model=schemas.Subject)
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    return crud.create_subject(db=db, subject=subject)

@app.post("/puchcards/", response_model=schemas.PuchCard)
def create_puchcard(puchcard: schemas.PuchCardCreate, db: Session = Depends(get_db)):
    return crud.create_puchcard(db=db, puchcard=puchcard)

@app.delete("/puchcards/{p_id}")
def delete_puchcard(p_id: int, db: Session = Depends(get_db)):
    success = crud.delete_puchcard(db, p_id)
    if not success:
        raise HTTPException(status_code=404, detail="PuchCard not found")
    return {"status": "success"}

@app.get("/subjects/", response_model=List[schemas.Subject])
def read_subjects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    subjects = crud.get_subjects(db, skip=skip, limit=limit)
    return subjects

@app.get("/subjects/active", response_model=List[schemas.Subject])
def read_active_subjects(db: Session = Depends(get_db)):
    subjects = crud.get_active_subjects(db)
    return subjects

@app.put("/subjects/{s_id}", response_model=schemas.Subject)
def update_subject(s_id: int, subject: schemas.SubjectUpdate, db: Session = Depends(get_db)):
    db_subject = crud.update_subject(db, s_id=s_id, subject=subject)
    if db_subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    return db_subject

@app.get("/puchcards/{year}/{month}", response_model=List[schemas.PuchCard])
def read_puchcards_by_month(year: int, month: int, db: Session = Depends(get_db)):
    return crud.get_puchcards_by_month(db, year=year, month=month)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
