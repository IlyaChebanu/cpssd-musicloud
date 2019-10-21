import unittest

from ..src import app
from ..src.utils import random_string, query


def get_uid(username):
    query_1 = (
        "SELECT uid FROM Users "
        "WHERE username = '%s'"
    ) % (
        username
    )
    return query(query_1, True)[0][0]


def cleanup_user(username):
    uid = get_uid(username)
    query_1 = (
          "DELETE FROM Users "
          "WHERE uid = '%d'"
    ) % (
        uid
    )
    query(query_1)
    query_2 = (
        "DELETE FROM Verification "
        "WHERE uid = '%d'"
    ) % (
        uid
    )
    query(query_2)


class UserTests(unittest.TestCase):
    """
    Unit tests for /users API endpoints.
    """
    def setUp(self):
        self.test_client = app.test_client(self)

    def test_registration_success(self):
        """
        Ensure user's can register correctly.
        """
        username = random_string(50)
        test_req_data = {
            "username": username,
            "email": username + "@fakemail.noshow",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"User created!"}\n', res.data)
        cleanup_user(username)

    def test_registration_fail_missing_username(self):
        """
        Ensure user registration fails if a username is not sent.
        """
        username = random_string(50)
        test_req_data = {
            "email": username + "@fakemail.noshow",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Some info is missing from your request."}\n', res.data)
        test_req_data = {
            "username": "",
            "email": username + "@fakemail.noshow",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Some info is missing from your request."}\n', res.data)

    def test_registration_fail_missing_email(self):
        """
        Ensure user registration fails if a email is not sent.
        """
        username = random_string(50)
        test_req_data = {
            "username": username,
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Some info is missing from your request."}\n', res.data)
        test_req_data = {
            "username": username,
            "email": "",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Some info is missing from your request."}\n', res.data)

    def test_registration_fail_missing_password(self):
        """
        Ensure user registration fails if a password is not sent.
        """
        username = random_string(50)
        test_req_data = {
            "username": username,
            "email": username + "@fakemail.noshow"
        }
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Some info is missing from your request."}\n', res.data)
        test_req_data = {
            "username": username,
            "email": username + "@fakemail.noshow",
            "password": ""
        }
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Some info is missing from your request."}\n', res.data)

    def test_registration_fail_invalid_email(self):
        """
        Ensure user registration fails if the email str provided is invalid.
        """
        username = random_string(50)
        test_req_data = {
            "username": username,
            "email": username,
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Invalid email address."}\n', res.data)

    def test_registration_fail_user_exists(self):
        """
        Ensure user registration fails if the provided credentials already are in use by another account.
        """
        username = random_string(50)
        test_req_data = {
            "username": username,
            "email": username + "@fakemail.noshow",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"User created!"}\n', res.data)
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"User already exists!"}\n', res.data)
        cleanup_user(username)

    def test_reverify_success(self):
        """
        Ensure resending of the verification email is working.
        """
        username = random_string(50)
        test_req_data = {
            "username": username,
            "email": username + "@fakemail.noshow",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"User created!"}\n', res.data)
        test_req_data = {
            "email": username + "@fakemail.noshow",
        }
        res = self.test_client.post(
            "/api/v1/users/reverify",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Verification email sent."}\n', res.data)
        cleanup_user(username)

    def test_reverify_fail_missing_email(self):
        """
        Ensure verification emails aren't resent if an email address is not provided.
        """
        test_req_data = {
        }
        res = self.test_client.post(
            "/api/v1/users/reverify",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Some info is missing from your request."}\n', res.data)
        test_req_data = {
            "email": ""
        }
        res = self.test_client.post(
            "/api/v1/users/reverify",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Some info is missing from your request."}\n', res.data)

    def test_reverify_fail_invalid_email(self):
        """
        Ensure verification emails aren't resent if an email address is invalid.
        """
        test_req_data = {
            "email": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users/reverify",
            data=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(b'{"message":"Bad request."}\n', res.data)
