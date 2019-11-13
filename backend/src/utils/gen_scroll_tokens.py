import jwt

from ..config import JWT_SECRET


def gen_scroll_tokens(current_page, total_pages, jwt_payload):
    back_page = None
    if 1 < current_page <= total_pages:
        jwt_payload["current_page"] = current_page - 1
        back_page = jwt.encode(jwt_payload, JWT_SECRET, algorithm='HS256').decode()

    next_page = None
    if current_page < total_pages:
        jwt_payload["current_page"] = current_page + 1
        next_page = jwt.encode(jwt_payload, JWT_SECRET, algorithm='HS256').decode()

    return back_page, next_page
