from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Subject(Base):
    __tablename__ = "subject"

    s_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(Integer, default=1)  # 1: 启用, 2: 关闭

    puchcards = relationship("PuchCard", back_populates="subject")

class PuchCard(Base):
    __tablename__ = "puchcard"

    p_id = Column(Integer, primary_key=True, index=True)
    s_id = Column(Integer, ForeignKey("subject.s_id"))
    status = Column(Integer, default=1) # 打卡状态
    datetime = Column(DateTime, default=datetime.now)

    subject = relationship("Subject", back_populates="puchcards")
