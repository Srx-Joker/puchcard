from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 默认数据库连接字符串，请根据实际情况修改
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/puchcard"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
