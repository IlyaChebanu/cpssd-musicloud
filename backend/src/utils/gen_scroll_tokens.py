"""
Function for generating scroll tokens for pagination supporting requests.
"""
import jwt

from ..config import JWT_SECRET


def gen_scroll_tokens(current_page, total_pages, jwt_payload):
    """
    Function for generating scroll tokens for pagination supporting requests.
    :param current_page:
    Int representing the current page the user is on.
    :param total_pages:
    Int representing the total number of pages available to select.
    :param jwt_payload:
    Dict containing all the parameters for the next search request.
    :return:
    Tuple containing the next_page & back_page tokens, or None's.
    """
    back_page = None
    if 1 < current_page <= total_pages:
        jwt_payload["current_page"] = current_page - 1
        back_page = jwt.encode(
            jwt_payload, JWT_SECRET, algorithm='HS256'
        ).decode()

    next_page = None
    if current_page < total_pages:
        jwt_payload["current_page"] = current_page + 1
        next_page = jwt.encode(
            jwt_payload, JWT_SECRET, algorithm='HS256'
        ).decode()

    return back_page, next_page
