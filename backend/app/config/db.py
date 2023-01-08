from os import getenv
from decouple import config as decouple_config

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


CURRENT_ENV = getenv('LOCAL_DEV_ENV', default="False") 

DATABASE_USERNAME = decouple_config("DATABASE_USERNAME")
DATABASE_PASSWORD = decouple_config("DATABASE_PASSWORD")

if CURRENT_ENV == "True":
    DATABASE_SERVER_PRIVATE_ADDRESS = decouple_config("LOCAL_DATABASE_SERVER_PRIVATE_ADDRESS")
else:
    DATABASE_SERVER_PRIVATE_ADDRESS = decouple_config("REMOTE_DATABASE_SERVER_PRIVATE_ADDRESS")

DATABASE_PORT = decouple_config("DATABASE_PORT")
DATABASE_NAME = decouple_config("DATABASE_NAME")

DATABASE_URL = f"postgres://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_SERVER_PRIVATE_ADDRESS}:{DATABASE_PORT}/{DATABASE_NAME}"

DATABASE_SERVER_PUBLIC_ADDRESS = decouple_config("LOCAL_DATABASE_SERVER_PRIVATE_ADDRESS")

DATABASE_PUBLIC_URL = f"postgres://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_SERVER_PUBLIC_ADDRESS}:{DATABASE_PORT}/{DATABASE_NAME}"


# SQLAlchemy config

engine = create_engine(DATABASE_URL, pool_size=50, max_overflow=85)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
