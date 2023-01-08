from sqlalchemy.orm.session import Session
from typing import Any
from fastapi import HTTPException


def get_model_by_field_first(
    db: Session, 
    model: Any, 
    model_field: str, 
    model_name: str, 
    field_value: Any,
    order_by_field: str = "id",
    order: str = "asc"
):
    try:
        if order != "asc":
            return db.query(model).filter(getattr(model, model_field) == field_value)\
                .order_by(getattr(model, order_by_field).desc()).first()

        return db.query(model).filter(getattr(model, model_field) == field_value).first()
    except AttributeError:
        raise HTTPException(403, detail="Invalid server request")
    except:
        raise HTTPException(404, detail=f"{model_name} not found")