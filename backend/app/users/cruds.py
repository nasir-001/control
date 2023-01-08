from pydantic import EmailStr, UUID4
from sqlalchemy.orm import Session
from fastapi import HTTPException

from users import models, schemas
from utils.users import get_password_hash, verify_password
from utils.users import get_password_hash, verify_password
from utils.misc import gen_random_password
from utils.db import get_model_by_field_first


def create_user(db: Session, user_data: schemas.UserCreate):
    user_dict = user_data.dict()
    unhashed_password = user_dict.pop('password')
    hashed_password = get_password_hash(unhashed_password)
    user_dict['password_hash'] = hashed_password
    user = models.User(**user_dict)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: EmailStr):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_uuid(db: Session, uuid: UUID4):
    return db.query(models.User).filter(models.User.uuid == uuid).first()


def get_password_reset_by_uuid(db: Session, uuid: UUID4):
    return db.query(models.PasswordReset). \
        filter(models.PasswordReset.uuid == uuid). \
        first()


def authenticate_user(email: EmailStr, password: str, dba: Session):
    user = get_user_by_email(db=dba, email=email)
    if not user:
        raise HTTPException(
            status_code=400,
            detail='Email and password do not match'
        )
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=400,
            detail='Email and password do not match'
        )
    return schemas.UserSchema.from_orm(user) 


def change_system_user_password(db: Session, user_uuid: str):
    db_user: models.User = get_model_by_field_first(db, models.User, "uuid", "User", user_uuid)
    if not db_user:
        raise HTTPException(404, detail="User not found")
    password = gen_random_password()
    hashed_password = get_password_hash(password)
    
    db_user.password_hash = hashed_password
    db.commit()
    return schemas.PasswordChangeOut(password=password)