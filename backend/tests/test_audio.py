import unittest
import mock
import json

from jwt.exceptions import InvalidSignatureError

from ..src import app
from .constants import TEST_TOKEN


class AudioTests(unittest.TestCase):
    """
    Unit tests for /audio API endpoints.
    """
    def setUp(self):
        self.test_client = app.test_client(self)

    @mock.patch('backend.src.controllers.audio.controllers.insert_song')
    def test_create_song_success(self, mocked_sid):
        """
        Ensure user's can create a song correctly.
        """
        mocked_sid.return_value = 1
        with mock.patch('backend.src.controllers.audio.controllers.insert_song_state'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
                vr.return_value = {
                    'uid': -1,
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
                    "title": "test song"
                }
                res = self.test_client.post(
                    "/api/v1/audio",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Your song project has been created', 'sid': 1}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_create_song_fail_missing_access_token(self):
        """
        Ensure creating a song fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_create_song_fail_access_token_expired(self):
        """
        Ensure creating a song fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_create_song_fail_bad_access_token_signature(self):
        """
        Ensure creating a song fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_create_song_fail_unknown_access_token_issue(self):
        """
        Ensure creating a song fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(503, res.status_code)

    def test_create_song_fail_missing_title(self):
        """
        Ensure creating a song fails if a title is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.return_value = {
                'uid': -1,
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
            test_req_data = {}
            res = self.test_client.post(
                "/api/v1/audio",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "title": ""
            }
            res = self.test_client.post(
                "/api/v1/audio",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.permitted_to_edit')
    def test_save_song_success(self, mocked_edit):
        """
        Ensure user's can save a song correctly.
        """
        mocked_edit.return_value = 1
        with mock.patch('backend.src.controllers.audio.controllers.insert_song_state'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
                vr.return_value = {
                    'uid': -1,
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
                    "sid": 1,
                    "song_state": {
                        "tracks": [
                            "test"
                        ]
                    }
                }
                res = self.test_client.post(
                    "/api/v1/audio/state",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Song state saved.'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_save_song_fail_missing_access_token(self):
        """
        Ensure saving a song fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio/state",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_save_song_fail_access_token_expired(self):
        """
        Ensure saving a song fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio/state",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_save_song_fail_bad_access_token_signature(self):
        """
        Ensure saving a song fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio/state",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_save_song_fail_unknown_access_token_issue(self):
        """
        Ensure saving a song fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/state",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(503, res.status_code)

    def test_save_song_fail_missing_sid(self):
        """
        Ensure saving a song fails if a sid is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.return_value = {
                'uid': -1,
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
                "song_state": {
                    "tracks": [
                        "test"
                    ]
                }
            }
            res = self.test_client.post(
                "/api/v1/audio/state",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": "",
                "song_state": {
                    "tracks": [
                        "test"
                    ]
                }
            }
            res = self.test_client.post(
                "/api/v1/audio",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_save_song_fail_missing_song_state(self):
        """
        Ensure saving a song fails if a song_state is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.return_value = {
                'uid': -1,
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
                "sid": 1
            }
            res = self.test_client.post(
                "/api/v1/audio/state",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_save_song_fail_missing_song_state_and_sid(self):
        """
        Ensure saving a song fails if a song_state and sid is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.return_value = {
                'uid': -1,
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
            test_req_data = {}
            res = self.test_client.post(
                "/api/v1/audio/state",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.permitted_to_edit')
    def test_save_song_fail_not_permitted_to_edit(self, mocked_edit):
        """
        Ensure saving a song state fails, if the user is not permitted to edit the requested song.
        """
        mocked_edit.return_value = 0
        with mock.patch('backend.src.controllers.audio.controllers.insert_song_state'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
                vr.return_value = {
                    'uid': -1,
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
                    "sid": 1,
                    "song_state": {
                        "tracks": [
                            "test"
                        ]
                    }
                }
                res = self.test_client.post(
                    "/api/v1/audio/state",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(403, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_song_state')
    @mock.patch('backend.src.controllers.audio.controllers.permitted_to_edit')
    def test_load_song_success(self, mocked_edit, mocked_state):
        """
        Ensure user's can load a song correctly.
        """
        mocked_edit.return_value = 1
        mocked_state.return_value = {}
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.return_value = {
                'uid': -1,
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
                "sid": 1
            }
            res = self.test_client.get(
                "/api/v1/audio/state",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {'song_state': {}}
            self.assertEqual(expected_body, json.loads(res.data))

    def test_load_song_fail_missing_access_token(self):
        """
        Ensure loading a song fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/state",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_load_song_fail_access_token_expired(self):
        """
        Ensure loading a song fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/state",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_load_song_fail_bad_access_token_signature(self):
        """
        Ensure loading a song fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/state",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_load_song_fail_unknown_access_token_issue(self):
        """
        Ensure loading a song fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/state",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(503, res.status_code)

    def test_load_song_fail_missing_sid(self):
        """
        Ensure loading a song fails if a sid is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.return_value = {
                'uid': -1,
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
            test_req_data = {}
            res = self.test_client.get(
                "/api/v1/audio/state",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": "",
            }
            res = self.test_client.get(
                "/api/v1/audio/state",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_song_state')
    @mock.patch('backend.src.controllers.audio.controllers.permitted_to_edit')
    def test_load_song_fail_forbidden(self, mocked_edit, mocked_state):
        """
        Ensure user's can't load a song they are not permitted to.
        """
        mocked_edit.return_value = 0
        mocked_state.return_value = {}
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.return_value = {
                'uid': -1,
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
                "sid": 1
            }
            res = self.test_client.get(
                "/api/v1/audio/state",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(403, res.status_code)
