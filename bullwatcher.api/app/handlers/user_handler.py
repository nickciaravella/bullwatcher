from typing import List

from app.data_access import bullwatcherdb
from app.domain.users import User


def login(user_info: dict) -> User:
    """
    Logs in the user and returns the user information.
    param user_info: contains the following
        identity_provider: str
        identity_id: str
        email: str
        full_name: str
    returns: domain.users.User object
    """
    user_id = user_info['identity_provider'] + '_' + user_info['identity_id']
    user = User(
        user_id=user_id,
        full_name=user_info['full_name'],
        email=user_info['email']
    )
    return bullwatcherdb.upsert_user(user)


def get_user(user_id: str) -> User:
    return bullwatcherdb.get_user(user_id)


def get_users() -> List[User]:
    return bullwatcherdb.get_all_users()


