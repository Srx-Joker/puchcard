from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from sqlalchemy.inspection import inspect
from . import models, schemas
from datetime import datetime

def object_as_dict(obj):
    return {c.key: getattr(obj, c.key) for c in inspect(obj).mapper.column_attrs}

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
    # Check if already punched for this subject on this day
    # Extract date from datetime
    target_date = puchcard.datetime.date() if puchcard.datetime else datetime.now().date()
    
    existing = db.query(models.PuchCard).filter(
        models.PuchCard.s_id == puchcard.s_id,
        func.date(models.PuchCard.datetime) == target_date
    ).first()

    if existing:
        return existing

    db_puchcard = models.PuchCard(
        s_id=puchcard.s_id,
        status=puchcard.status,
        datetime=puchcard.datetime or datetime.now()
    )
    db.add(db_puchcard)
    db.commit()
    db.refresh(db_puchcard)
    return db_puchcard

def delete_puchcard(db: Session, p_id: int):
    db_puchcard = db.query(models.PuchCard).filter(models.PuchCard.p_id == p_id).first()
    if db_puchcard:
        db.delete(db_puchcard)
        db.commit()
        return True
    return False

def check_daily_completion(db: Session, year: int, month: int):
    # Get active subjects count
    active_subjects_count = db.query(models.Subject).filter(models.Subject.status == 1).count()
    if active_subjects_count == 0:
        return {}

    # Get punch counts per day for active subjects
    punches = db.query(
        extract('day', models.PuchCard.datetime).label('day'),
        func.count(models.PuchCard.s_id).label('count')
    ).join(models.Subject, models.PuchCard.s_id == models.Subject.s_id)\
    .filter(
        models.Subject.status == 1, # Only count punches for currently active subjects
        extract('year', models.PuchCard.datetime) == year,
        extract('month', models.PuchCard.datetime) == month
    ).group_by(extract('day', models.PuchCard.datetime)).all()

    completion_status = {}
    for day, count in punches:
        completion_status[int(day)] = (count >= active_subjects_count)
    
    return completion_status
