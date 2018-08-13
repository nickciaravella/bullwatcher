from typing import List, Optional

from application import db
from app.domain.users import User
from app.database import models
from datetime import datetime


def get_all_users() -> List[User]:
    db_users = models.User.query.all()
    return [_convert_db_user_to_domain(u) for u in db_users]


def get_user(user_id: str) -> Optional[User]:
    db_user: Optional[models.User] = db.session.query(models.User).get(user_id)
    if not db_user:
        return None
    return _convert_db_user_to_domain(db_user)


def upsert_user(user: User) -> User:
    db_user: Optional[models.User] = db.session.query(models.User).get(user.user_id)
    if not db_user:
        return create_user(user)

    db_user.full_name = user.full_name
    db_user.email = user.email
    db.session.commit()
    return _convert_db_user_to_domain(db_user)


def create_user(user: User) -> User:
    db_user = _convert_domain_user_to_db(user)
    db_user.created_date = datetime.utcnow()
    db.session.add(db_user)
    db.session.commit()
    return _convert_db_user_to_domain(db_user)


def _convert_db_user_to_domain(db_user):
    return User(
        user_id=db_user.user_id,
        full_name=db_user.full_name,
        email=db_user.email
    )


def _convert_domain_user_to_db(user):
    db_user = models.User()
    db_user.user_id = user.user_id
    db_user.email = user.email
    db_user.full_name = user.full_name
    return db_user
