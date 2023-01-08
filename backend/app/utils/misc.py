from secrets import token_urlsafe


def gen_random_password():
    return token_urlsafe(12)