import unittest
import mock
import json

from jwt.exceptions import InvalidSignatureError

from ..src import app
from ..src.models.errors import NoResults
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

    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_compiled_songs')
    def test_get_compiled_songs_success_no_scroll_token_or_uid(self, mocked_num_songs, mocked_songs):
        """
        Ensure getting all compiled songs is successful without scroll tokens.
        """
        test_songs = [
            [1, 1, "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None],
            [2, 1, "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.return_value = {
                'uid': -1,
                'email': 'username@fakemail.noshow',
                'username': 'username',
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
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'compiled_songs': test_songs,
                'current_page': 1,
                'next_page': None,
                'songs_per_page': 50,
                'total_pages': 1
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs')
    def test_get_compiled_songs_success_next_scroll_token_and_no_uid(self, mocked_songs):
        """
        Ensure getting songs is successful with a next page scroll token and no uid encoded.
        """
        test_song = [
            [2, 1, "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOm51bGwsInRvdGFsX3BhZ"
                "2VzIjoyLCJzb25nc19wZXJfcGFnZSI6MSwiY3VycmVudF9wYWdlIjoyfQ.69SyUqB3"
                "nFPhjdBGNuX-_bQlWU1awOoo_YLvrDF9d6Q"
            )
        }
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
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOm51bGwsInRvdGFsX3BhZ2VzIjoyLCJzb25nc19wZXJfcGFnZSI6MSwiY3VycmVudF9wYWdlIjoxfQ.heGjd8av77DIX83CJop8ZsmrNWLvTl1voX00GJS7xJo',
                'current_page': 2,
                'next_page': None,
                'compiled_songs': test_song,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs')
    def test_get_compiled_songs_success_back_scroll_token_and_no_uid(self, mocked_songs):

        """
        Ensure getting songs is successful with a back page scroll token and no uid encoded.
        """
        test_song = [
            [1, 1, "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOm51bGwsIn"
                "RvdGFsX3BhZ2VzIjoyLCJzb25nc19wZXJfcGFnZSI6MSwiY3VycmVud"
                "F9wYWdlIjoxfQ.heGjd8av77DIX83CJop8ZsmrNWLvTl1voX00GJS7x"
                "Jo"
            )
        }
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
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOm51bGwsInRvdGFsX3BhZ2VzIjoyLCJzb25nc19wZXJfcGFnZSI6MSwiY3VycmVudF9wYWdlIjoyfQ.69SyUqB3nFPhjdBGNuX-_bQlWU1awOoo_YLvrDF9d6Q',
                'compiled_songs': test_song,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs_by_uid')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_compiled_songs_by_uid')
    def test_get_compiled_songs_success_with_uid_and_no_scroll_token(self, mocked_num_songs, mocked_songs):
        """
        Ensure getting all compiled songs for a specified uid is successful without scroll tokens.
        """
        test_songs = [
            [1, 1, "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None],
            [2, 1, "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.return_value = {
                'uid': -1,
                'email': 'username@fakemail.noshow',
                'username': 'username',
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
                "uid": 1
            }
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'compiled_songs': test_songs,
                'current_page': 1,
                'next_page': None,
                'songs_per_page': 50,
                'total_pages': 1
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs_by_uid')
    def test_get_compiled_songs_success_next_scroll_token_and_with_uid(self, mocked_songs):
        """
        Ensure getting songs from a specified uid is successful with a next page scroll token.
        """
        test_song = [
            [2, 1, "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIxIiwidG90YWxfcGFnZXMi"
                "OjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjJ9.FrBOO89SyKC5HVkN"
                "FFkRboBq3u4j129gTuvWnsGTy-w"
            ),
            "uid": 1
        }
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
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIxIiwidG90YWxfcGFnZXMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjF9.68zZKI-AZX_OM2hq2p9LFHX1oWYWRpk3S08aiNUlX4A',
                'current_page': 2,
                'next_page': None,
                'compiled_songs': test_song,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs_by_uid')
    def test_get_compiled_songs_success_back_scroll_token_and_with_uid(self, mocked_songs):
        """
        Ensure getting songs for a specified uid is successful with a back page scroll token.
        """
        test_song = [
            [1, 1, "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIxIiwidG90YWxfcGFnZ"
                "XMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjF9.68zZKI-AZX"
                "_OM2hq2p9LFHX1oWYWRpk3S08aiNUlX4A"
            ),
            "uid": 1
        }
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
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIxIiwidG90YWxfcGFnZXMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjJ9.FrBOO89SyKC5HVkNFFkRboBq3u4j129gTuvWnsGTy-w',
                'compiled_songs': test_song,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_compiled_songs_fail_missing_access_token(self):
        """
        Ensure getting songs fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/compiled_songs",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_compiled_songs_fail_access_token_expired(self):
        """
        Ensure getting a songs fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_compiled_songs_fail_bad_access_token_signature(self):
        """
        Ensure getting songs fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_compiled_songs_fail_unknown_access_token_issue(self):
        """
        Ensure getting songs fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(503, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_compiled_songs_by_uid')
    def test_get_compiled_songs_fail_no_scroll_token_exceeded_last_page(self, mocked_num_songs):
        """
        Ensure getting songs fails if the user tries to access a page that doesn't exist.
        """
        mocked_num_songs.return_value = 2
        test_req_data = {
            "current_page": 12,
            "posts_per_page": 1
        }
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
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_compiled_songs_fail_sent_both_tokens(self):
        """
        Ensure getting songs fails if the user tries to send a next_page & back_page token.
        """
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b"
                "3RhbF9wYWdlcyI6MiwicG9zdHNfcGVyX3BhZ2UiOjEsImN1cnJlbnR"
                "fcGFnZSI6Mn0.rOexY_eF1nUjFJvpDbbbTTgpoVjxIh9ZbVs0Q6ggR"
                "uQ"
            ),
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0x"
                "LCJ0b3RhbF9wYWdlcyI6MiwicG9zdHNfcGVyX3BhZ2UiOjEsI"
                "mN1cnJlbnRfcGFnZSI6MX0.pkQCRbBgvwuozzSG6LK-kFGuxT"
                "8YYsYN3m9g-AzquyM"
            )
        }
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
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_all_uncompiled_songs_by_uid')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_uncompiled_songs_by_uid')
    def test_get_uncompiled_songs_success_no_scroll_token_or_uid(self, mocked_num_songs, mocked_songs):
        """
        Ensure getting all uncompiled songs for the current user is successful without scroll tokens.
        """
        test_songs = [
            [1, 1, "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None],
            [2, 1, "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.return_value = {
                'uid': -1,
                'email': 'username@fakemail.noshow',
                'username': 'username',
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
            res = self.test_client.get(
                "/api/v1/audio/uncompiled_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'uncompiled_songs': test_songs,
                'current_page': 1,
                'next_page': None,
                'songs_per_page': 50,
                'total_pages': 1
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_uncompiled_songs_by_uid')
    def test_get_uncompiled_songs_success_next_scroll_token_and_no_uid(self, mocked_songs):
        """
        Ensure getting uncompiled songs for the current user is successful with a next page scroll token.
        """
        test_song = [
            [2, 1, "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlc"
                "yI6Miwic29uZ3NfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0"
                ".bNW1teHPVxJgLLi_2MHodcdC8djnsu-QU_9m_AE5Sfc"
            )
        }
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
            res = self.test_client.get(
                "/api/v1/audio/uncompiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlcyI6Miwic29uZ3NfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.lPvUPb8m3ldR3tOfX26YQjMM1bczO05d4-vuuXarl90',
                'current_page': 2,
                'next_page': None,
                'uncompiled_songs': test_song,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_uncompiled_songs_by_uid')
    def test_get_uncompiled_songs_success_back_scroll_token_and_no_uid(self, mocked_songs):
        """
        Ensure getting uncompiled songs for the current user is successful with a back page scroll token.
        """
        test_song = [
            [1, 1, "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlcy"
                "I6Miwic29uZ3NfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.l"
                "PvUPb8m3ldR3tOfX26YQjMM1bczO05d4-vuuXarl90"
            )
        }
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
            res = self.test_client.get(
                "/api/v1/audio/uncompiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlcyI6Miwic29uZ3NfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0.bNW1teHPVxJgLLi_2MHodcdC8djnsu-QU_9m_AE5Sfc',
                'uncompiled_songs': test_song,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_uncompiled_songs_fail_missing_access_token(self):
        """
        Ensure getting uncompiled songs fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/uncompiled_songs",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_uncompiled_songs_fail_access_token_expired(self):
        """
        Ensure getting uncompiled songs fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/uncompiled_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_uncompiled_songs_fail_bad_access_token_signature(self):
        """
        Ensure getting uncompiled songs fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/uncompiled_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_uncompiled_songs_fail_unknown_access_token_issue(self):
        """
        Ensure getting uncompiled songs fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/uncompiled_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(503, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_uncompiled_songs_by_uid')
    def test_get_uncompiled_songs_fail_no_scroll_token_exceeded_last_page(self, mocked_num_songs):
        """
        Ensure getting uncompiled songs fails if the user tries to access a page that doesn't exist.
        """
        mocked_num_songs.return_value = 2
        test_req_data = {
            "current_page": 12,
            "posts_per_page": 1
        }
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
            res = self.test_client.get(
                "/api/v1/audio/uncompiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_uncompiled_songs_fail_sent_both_tokens(self):
        """
        Ensure getting uncompiled songs fails if the user tries to send a next_page & back_page token.
        """
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b"
                "3RhbF9wYWdlcyI6MiwicG9zdHNfcGVyX3BhZ2UiOjEsImN1cnJlbnR"
                "fcGFnZSI6Mn0.rOexY_eF1nUjFJvpDbbbTTgpoVjxIh9ZbVs0Q6ggR"
                "uQ"
            ),
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0x"
                "LCJ0b3RhbF9wYWdlcyI6MiwicG9zdHNfcGVyX3BhZ2UiOjEsI"
                "mN1cnJlbnRfcGFnZSI6MX0.pkQCRbBgvwuozzSG6LK-kFGuxT"
                "8YYsYN3m9g-AzquyM"
            )
        }
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
            res = self.test_client.get(
                "/api/v1/audio/uncompiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_song_data')
    def test_get_song_data_success(self, mocked_song):
        """
        Ensure user's can get a song's info successfully.
        """
        test_song = [[1, 1, "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None]]
        mocked_song.return_value = test_song
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
                "/api/v1/audio/song",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {'song': test_song}
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_song_data_fail_missing_sid(self):
        """
        Ensure user's can't get a song's info if they don't provide an sid.
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
                "/api/v1/audio/song",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": ""
            }
            res = self.test_client.get(
                "/api/v1/audio/song",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_song_data')
    def test_get_song_data_fail_bad_sid(self, mocked_song):
        """
        Ensure user's can't get a song's info if they provide a bad sid.
        """
        mocked_song.side_effect = NoResults
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
                "sid": "-1"
            }
            res = self.test_client.get(
                "/api/v1/audio/song",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(404, res.status_code)

    def test_get_song_data_fail_missing_access_token(self):
        """
        Ensure getting song data fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/song",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_song_data_fail_access_token_expired(self):
        """
        Ensure getting song data fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/song",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_song_data_fail_bad_access_token_signature(self):
        """
        Ensure getting song data fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/song",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_song_data_fail_unknown_access_token_issue(self):
        """
        Ensure getting song data fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as vr:
            vr.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/song",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(503, res.status_code)

