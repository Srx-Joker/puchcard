from sqlalchemy.orm import Session
from sqlalchemy import extract
from . import models, schemas
from datetime import datetime

def get_subjects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Subject).offset(skip).limit(limit).all()

def get_active_subjects(db: Session):
    return db.query(models.Subject).filter(models.Subject.status == 1).all()

def create_subject(db: Session, subject: schemas.SubjectCreate):
    db_subject = models.Subject(name=subject.name, status=subject.status)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def update_subject(db: Session, s_id: int, subject: schemas.SubjectUpdate):
    db_subject = db.query(models.Subject).filter(models.Subject.s_id == s_id).first()
    if db_subject:
        if subject.name is not None:
            db_subject.name = subject.name
        if subject.status is not None:
            db_subject.status = subject.status
        db.commit()
        db.refresh(db_subject)
    return db_subject

def get_puchcards(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PuchCard).offset(skip).limit(limit).all()

def get_puchcards_by_month(db: Session, year: int, month: int):
    return db.query(models.PuchCard).filter(
        extract('year', models.PuchCard.datetime) == year,
        extract('month', models.PuchCard.datetime) == month
    ).all()

def create_puchcard(db: Session, puchcard: schemas.PuchCardCreate):
    # Check if already punched for this subject on this day (simplified logic, assumes one punch per day per subject)
    # Ideally should check date range but for simplicity just inserting
    db_puchcard = models.PuchCard(
        s_id=puchcard.s_id,
        status=puchcard.status,
        datetime=puchcard.datetime or datetime.now()
    )
    db.add(db_puchcard)
    db.commit()
    db.refresh(db_puchcard)
    return db_puchcard
