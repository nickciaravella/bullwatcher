class User:
    def __init__(self, user_id, full_name, email):
        self.user_id = user_id
        self.full_name = full_name
        self.email = email

    def to_json(self):
        return {
            'user_id': self.user_id,
            'full_name': self.full_name,
            'email': self.email,
        }