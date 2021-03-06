# pylint: disable=C0302, C0301, R0904
"""
Test suite for /auth endpoints.
"""
import unittest
import json
import mock

from jwt.exceptions import InvalidSignatureError
from argon2.exceptions import VerifyMismatchError

from ..src import APP
from ..src.utils.random_string import random_string
from .constants import TEST_TOKEN, MOCKED_TOKEN


class AuthTests(unittest.TestCase):
    """
    Unit tests for /auth API endpoints.
    """
    def setUp(self):
        self.test_client = APP.test_client(self)

    @mock.patch('backend.src.controllers.auth.controllers.get_verification_by_code')
    def test_verify_success(self, mock_user):
        """
        Ensure user's can verify correctly.
        """
        code = random_string(64)
        mock_user.return_value = [code, "-1"]
        test_req_data = {
            "code": code
        }

        with mock.patch('backend.src.controllers.auth.controllers.verify_user'):
            with mock.patch('backend.src.controllers.auth.controllers.delete_verification'):
                res = self.test_client.get(
                    "/api/v1/auth/verify",
                    query_string=test_req_data,
                    follow_redirects=True
                )
                with open("./src/controllers/auth/success.html", "rb") as file:
                    expexcted_page = file.read()
                    self.assertEqual(200, res.status_code)
                    self.assertEqual(expexcted_page, res.data)

    def test_verify_fail_bad_code(self):
        """
        Ensure user's verification fails if the code is bad.
        """
        code = random_string(63)
        test_req_data = {
            "code": code
        }
        res = self.test_client.get(
            "/api/v1/auth/verify",
            query_string=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(400, res.status_code)

    @mock.patch('backend.src.controllers.auth.controllers.time.time')
    @mock.patch('backend.src.controllers.auth.controllers.PasswordHasher.verify')
    @mock.patch('backend.src.controllers.auth.controllers.get_user_via_username')
    def test_login_success(self, mocked_user, mocked_verify, mocked_time):
        """
        Ensure user's can login correctly.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 1, "http://image.fake"]]
        mocked_verify.return_value = True
        mocked_time.return_value = 10000
        test_req_data = {
            "username": "username",
            "password": "1234"
        }

        with mock.patch('backend.src.controllers.auth.controllers.insert_login'):
            res = self.test_client.post(
                "/api/v1/auth/login",
                json=test_req_data,
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)

    def test_login_fail_missing_username(self):
        """
        Ensure logins fail if the user fails to send a username.
        """
        test_req_data = {
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/auth/login",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "username": "",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/auth/login",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_login_fail_missing_password(self):
        """
        Ensure logins fail if the user fails to send a username.
        """
        test_req_data = {
            "username": "username"
        }
        res = self.test_client.post(
            "/api/v1/auth/login",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "username": "username",
            "password": ""
        }
        res = self.test_client.post(
            "/api/v1/auth/login",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_login_fail_missing_username_and_password(self):
        """
        Ensure logins fail if the user fails to send a username.
        """
        test_req_data = {}
        res = self.test_client.post(
            "/api/v1/auth/login",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "username": "",
            "password": ""
        }
        res = self.test_client.post(
            "/api/v1/auth/login",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
    @mock.patch('backend.src.controllers.auth.controllers.PasswordHasher.verify')
    @mock.patch('backend.src.controllers.auth.controllers.get_user_via_username')
    def test_login_fail_bad_credentials(self, mocked_user, mocked_verify):
        """
        Ensure login attempt fails if bad credentials are provided.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 1, "http://image.fake"]]
        mocked_verify.side_effect = VerifyMismatchError
        test_req_data = {
            "username": "username",
            "password": "1234"
        }

        with mock.patch('backend.src.controllers.auth.controllers.insert_login'):
            res = self.test_client.post(
                "/api/v1/auth/login",
                json=test_req_data,
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.auth.controllers.PasswordHasher.verify')
    @mock.patch('backend.src.controllers.auth.controllers.get_user_via_username')
    def test_login_fail_unverified(self, mocked_user, mocked_verify):
        """
        Ensure login attempt fails if account not verified.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0]]
        mocked_verify.return_value = True
        test_req_data = {
            "username": "username",
            "password": "1234"
        }

        with mock.patch('backend.src.controllers.auth.controllers.insert_login'):
            res = self.test_client.post(
                "/api/v1/auth/login",
                json=test_req_data,
                follow_redirects=True
            )
            self.assertEqual(403, res.status_code)

    def test_logout_success(self):
        """
        Ensure user's can logout correctly.
        """
        with mock.patch('backend.src.controllers.auth.controllers.delete_login'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = MOCKED_TOKEN
                res = self.test_client.post(
                    "/api/v1/auth/logout",
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'User has been successfully logged out!'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_logout_fail_missing_access_token(self):
        """
        Ensure getting a logout request fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/auth/logout",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_logout_fail_access_token_expired(self):
        """
        Ensure getting a logout request fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/auth/logout",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_logout_fail_bad_access_token_signature(self):
        """
        Ensure getting a logout request fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/auth/logout",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_logout_fail_unknown_access_token_issue(self):
        """
        Ensure getting a logout request fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/auth/logout",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)
