from typing import List, Optional
from pydantic import BaseModel, EmailStr, UUID4, HttpUrl
from pydantic.fields import Field

from mixins.schemas import BaseSchemaMixin, BaseUACSchemaMixin, GeneralSchemaOut
from access_control.schemas import GroupSchema
from unit import schemas as unit_schema

class UserOut(BaseSchemaMixin):
    email: EmailStr
    firstname: str
    lastname: str
    middlename: Optional[str] = ''

    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    email: EmailStr
    firstname: str
    lastname: str
    middlename: Optional[str]
    password: str


class UserGroup(BaseModel):
    groups: List[str]


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    middlename: Optional[str] = None


class ChagePasswordFromDashboard(BaseModel):
    current_password: str
    new_password: str


class UserSchema(BaseSchemaMixin):
    email: EmailStr
    firstname: str
    lastname: str
    middlename: Optional[str] = ''
    is_active: bool
    is_superuser: bool
    groups: List[GroupSchema]

    @property
    def permissions(self) -> List[str]:
        perms = []
        for group in self.groups:
            for role in group.roles:
                for perm in role.permissions:
                    perms.append(perm.name)
        return list(set(perms))

    def has_permission(self, permission: str) -> bool:
        return permission in self.permissions

    class Config:
        orm_mode = True


class UserSchemaOut(BaseSchemaMixin):
    email: EmailStr
    firstname: str
    lastname: str
    middlename: Optional[str] = ''
    is_active: bool
    is_superuser: bool
    useraccount: unit_schema.UserAccountSchemaOut

    @property
    def permissions(self) -> List[str]:
        perms = []
        for group in self.groups:
            for role in group.roles:
                for perm in role.permissions:
                    perms.append(perm.name)
        return list(set(perms))

    def has_permission(self, permission: str) -> bool:
        return permission in self.permissions

    class Config:
        orm_mode = True


class ResetPassword(BaseModel):
    password: str


class PasswordChangeOut(BaseModel):
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    permissions: Optional[List[str]] = Field(None)


class Login(BaseModel):
    email: str
    password: str
