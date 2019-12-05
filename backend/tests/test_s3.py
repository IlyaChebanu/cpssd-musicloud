# pylint: disable=C0302, C0301, R0904
"""
Test suite for /s3 endpoints.
"""
import unittest
import json
import mock

from jwt.exceptions import InvalidSignatureError

from ..src import APP
from .constants import TEST_TOKEN


class MockBoto3Client:   # pylint: disable=R0903
    """
    A fake boto3 client for mocking in tests.
    """
    def generate_presigned_post(self, **kwargs):  # pylint: disable=W0613, R0201
        """
        Mocked generate_presigned_post func
        """
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
        Ensure reading from the S3 bucket behave correctly.
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

    def test_signed_form_post_fail_missing_dir(self):
        """
        Ensure reading from the S3 bucket fails if a dir value is not sent.
        """
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
            test_req_data = {
                "fileName": "test",
                "fileType": "wav"
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "dir": "",
                "fileName": "test",
                "fileType": "wav"
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_signed_form_post_fail_missing_filename(self):
        """
        Ensure reading from the S3 bucket fails if a fileName value is not sent.
        """
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
            test_req_data = {
                "dir": "audio",
                "fileType": "wav"
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "dir": "audio",
                "fileName": "",
                "fileType": "wav"
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_signed_form_post_fail_missing_filetype(self):
        """
        Ensure reading from the S3 bucket fails if a fileType value is not sent.
        """
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
            test_req_data = {
                "dir": "audio",
                "fileName": "test",
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "dir": "audio",
                "fileName": "test",
                "fileType": ""
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_signed_form_post_fail_missing_filename_and_filetype(self):
        """
        Ensure reading from the S3 bucket fails if the fileType and fileName values are not sent.
        """
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
            test_req_data = {
                "dir": "audio",
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "dir": "audio",
                "fileName": "",
                "fileType": ""
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_signed_form_post_fail_missing_filename_and_dir(self):
        """
        Ensure reading from the S3 bucket fails if the dir and fileName values are not sent.
        """
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
            test_req_data = {
                "fileType": "wav"
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "dir": "",
                "fileName": "",
                "fileType": "wav"
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_signed_form_post_fail_missing_filetype_and_dir(self):
        """
        Ensure reading from the S3 bucket fails if the dir and fileType values are not sent.
        """
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
            test_req_data = {
                "fileName": "test",
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "dir": "",
                "fileName": "test",
                "fileType": ""
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_signed_form_post_fail_missing_everything(self):
        """
        Ensure reading from the S3 bucket fails if no values are sent.
        """
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
                json={},
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "dir": "",
                "fileName": "",
                "fileType": ""
            }
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_signed_form_post_fail_invalid_dir(self):
        """
        Ensure reading from the s3 bucket fails if the dir value sent is invalid.
        """
        test_req_data = {
            "dir": "notADir",
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
            self.assertEqual(422, res.status_code)

    def test_signed_form_post_fail_missing_access_token(self):
        """
        Ensure reading from the s3 bucket fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/s3/signed-form-post",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_signed_form_post_fail_access_token_expired(self):
        """
        Ensure reading from the s3 bucket fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_signed_form_post_fail_bad_access_token_signature(self):
        """
        Ensure reading from the s3 bucket fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_signed_form_post_fail_unknown_access_token_issue(self):
        """
        Ensure reading from the s3 bucket fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/s3/signed-form-post",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)
