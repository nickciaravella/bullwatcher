def commit_with_rollback(session):
    try:
        return session.commit()
    except:
        session.rollback()
        raise