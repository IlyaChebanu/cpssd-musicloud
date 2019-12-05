# pylint: disable=C0302, C0301, R0904
"""
Test suite for /s3 endpoints.
"""
import unittest
import mock
import json

from ..src import APP
from .constants import TEST_TOKEN


class MockBoto3Client(object):
    """
    A fake boto3 client for mocking in tests.
    """
    def generate_presigned_post(self, **kwargs):
        return "http://fake.url"


class S3Tests(unittest.TestCase):
    """
    Unit tests for /s3 API endpoints.
    """
    def setUp(self):
        self.test_client = APP.test_client(self)

    @mock.patch("backend.src.controllers.s3.controllers.boto3.client")
    def test_signed_form_post_success(self, mock_url):
        """
        Ensure uploads to the S3 bucket behave correctly.
        """
        mock_url.return_value = MockBoto3Client()
        test_req_data = {
            "dir": "audio",
            "fileName": "test",
            "fileType": "wav"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
                'uid': -2,
                'email': 'username2@fakemail.noshow',
                'username': 'username2',
                'verified': 1,
                'random_value': (
                    'nCSihTTgfbQAtxfKXRMkicFxvXbeBulFJthWwUEMtJWXTfN'
                    'swNzJIKtbzFoKujvLmHdcJhCROMbneQplAuCdjBNNfLAJQg'
                    'UWpXafGXCmTZoAQEnXIPuGJslmvMvfigfNjgeHysWDAoBtw'
                    'HJahayNPunFvEfgGoMWIBdnHuESqEZNAEHvxXvCnAcgdzpL'
                    'ELmnSZOPJpFalZibEPkHTGaGchmhlCXTKohnneRNEzcrLzR'
                    'zeyvzkssMFUTdeEvzbKu'
                )
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                "message": "Signed url for file uploading has been provided",
                "signed_url": 'http://fake.url'
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_registration_fail_missing_username(self):
        """
        Ensure user registration fails if a username is not sent.
        """
        test_req_data = {
            "email": "username@fakemail.noshow",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "username": "",
            "email": "username@fakemail.noshow",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_registration_fail_missing_email(self):
        """
        Ensure user registration fails if a email is not sent.
        """
        test_req_data = {
            "username": "username",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "username": "username",
            "email": "",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_registration_fail_missing_password(self):
        """
        Ensure user registration fails if a password is not sent.
        """
        test_req_data = {
            "username": "username",
            "email": "username@fakemail.noshow"
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "username": "username",
            "email": "username@fakemail.noshow",
            "password": ""
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_registration_fail_missing_password_and_email(self):
        """
        Ensure user registration fails if a password & email are not sent.
        """
        test_req_data = {
            "username": "username",
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "username": "username",
            "email": "",
            "password": ""
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_registration_fail_missing_password_and_username(self):
        """
        Ensure user registration fails if a password & username are not sent.
        """
        test_req_data = {
            "email": "username@fakemail.noshow",
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "username": "",
            "email": "username@fakemail.noshow",
            "password": ""
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_registration_fail_missing_username_and_email(self):
        """
        Ensure user registration fails if a username & email are not sent.
        """
        test_req_data = {
            "password": "1234",
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "username": "",
            "email": "",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_registration_fail_missing_everything(self):
        """
        Ensure user registration fails if a username & email are not sent.
        """
        test_req_data = {}
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "username": "",
            "email": "",
            "password": ""
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_registration_fail_failed_password_hashing(self):
        """
        Ensure user registration fails if the password hashing fails.
        """
        test_req_data = {
            "username": "username",
            "email": "username@fakemail.noshow",
            "password": "1234"
        }
        with mock.patch(
                'backend.src.controllers.users.controllers.PasswordHasher.hash'
        ) as file:
            file.side_effect = Exception()
            res = self.test_client.post(
                "/api/v1/users",
                json=test_req_data,
                follow_redirects=True
            )
        self.assertEqual(500, res.status_code)

    def test_registration_fail_invalid_email(self):
        """
        Ensure user registration fails if the email str provided is invalid.
        """
        test_req_data = {
            "username": "username",
            "email": "username",
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_registration_fail_user_exists(self):
        """
        Ensure user registration fails if the provided credentials already are in use by another account.
        """
        test_req_data = {
            "username": "username",
            "email": "username@fakemail.noshow",
            "password": "1234"
        }
        with mock.patch(
                'backend.src.controllers.users.controllers.insert_user') as file:
            file.side_effect = IntegrityError()
            res = self.test_client.post(
                "/api/v1/users",
                json=test_req_data,
                follow_redirects=True
            )
        self.assertEqual(409, res.status_code)