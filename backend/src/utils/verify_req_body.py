def verify_req_body(req_body, expected_values):
    """Verifies that the request body contains all the expected key/value pairs."""
    if all(k in req_body for k in expected_values):
        for k in expected_values:
            if len(req_body.get(k)) == 0:
                return False
        return True
    return False
