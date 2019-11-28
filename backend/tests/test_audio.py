import unittest
import mock
import json

from jwt.exceptions import InvalidSignatureError

from ..src import APP
from ..src.models.errors import NoResults
from .constants import TEST_TOKEN


class AudioTests(unittest.TestCase):
    """
    Unit tests for /audio API endpoints.
    """
    def setUp(self):
        self.test_client = APP.test_client(self)

    @mock.patch('backend.src.controllers.audio.controllers.insert_song')
    def test_create_song_success(self, mocked_sid):
        """
        Ensure user's can create a song correctly.
        """
        mocked_sid.return_value = 1
        with mock.patch('backend.src.controllers.audio.controllers.insert_song_state'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = {
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_create_song_fail_missing_title(self):
        """
        Ensure creating a song fails if a title is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = {
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/state",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_save_song_fail_missing_sid(self):
        """
        Ensure saving a song fails if a sid is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = {
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/state",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_load_song_fail_missing_sid(self):
        """
        Ensure loading a song fails if a sid is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
    def test_get_compiled_songs_success_no_scroll_token_or_username(self, mocked_num_songs, mocked_songs):
        """
        Ensure getting all compiled songs is successful without scroll tokens.
        """
        test_songs = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None, 8]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
            expected_songs = [
                {
                    "sid": 1,
                    "username": "username",
                    "title": "A test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:39 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': None,
                'songs': expected_songs,
                'current_page': 1,
                'next_page': None,
                'songs_per_page': 50,
                'total_pages': 1
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs')
    def test_get_compiled_songs_success_next_scroll_token_and_no_username(self, mocked_songs):
        """
        Ensure getting songs is successful with a next page scroll token and no username encoded.
        """
        test_song = [
            [2, "username2", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None, 8]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOm51bGwsInRvdGFsX3BhZ"
                "2VzIjoyLCJzb25nc19wZXJfcGFnZSI6MSwiY3VycmVudF9wYWdlIjoyfQ.69SyUqB3"
                "nFPhjdBGNuX-_bQlWU1awOoo_YLvrDF9d6Q"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
            expected_songs = [
                {
                    "sid": 2,
                    "username": "username2",
                    "title": "A very test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:40 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6bnVsbCwidG90YWxfcGFnZXMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjF9.FapIICe8ZHTTHSzw_SxsD-L6iePSI47uX2_bOp7Kwjg',
                'current_page': 2,
                'next_page': None,
                'songs': expected_songs,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs')
    def test_get_compiled_songs_success_back_scroll_token_and_no_username(self, mocked_songs):

        """
        Ensure getting songs is successful with a back page scroll token and no username encoded.
        """
        test_song = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None, 8]
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
            expected_songs = [
                {
                    "sid": 1,
                    "username": "username",
                    "title": "A test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:39 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6bnVsbCwidG90YWxfcGFnZXMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjJ9.Q85alHs0LPZziERUTv0G4kUZeV2R5T9_4nYRi1ketBE',
                'songs': expected_songs,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_user_via_username')
    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs_by_uid')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_compiled_songs_by_uid')
    def test_get_compiled_songs_success_with_username_and_no_scroll_token(self, mocked_num_songs, mocked_songs, mocked_user):
        """
        Ensure getting all compiled songs for a specified username is successful without scroll tokens.
        """
        test_songs = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None, 8],
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None, 8]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        mocked_user.return_value =[[1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "username": "username"
            }
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_songs = [
                {
                    "sid": 1,
                    "username": "username",
                    "title": "A test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:39 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                },
                {
                    "sid": 2,
                    "username": "username",
                    "title": "A very test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:40 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': None,
                'songs': expected_songs,
                'current_page': 1,
                'next_page': None,
                'songs_per_page': 50,
                'total_pages': 1
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs')
    def test_get_compiled_songs_success_next_scroll_token_and_with_username(self, mocked_songs):
        """
        Ensure getting songs using a next page scroll token works with username also being defined.
        """
        test_song = [
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None, 8]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIxIiwidG90YWxfcGFnZXMi"
                "OjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjJ9.FrBOO89SyKC5HVkN"
                "FFkRboBq3u4j129gTuvWnsGTy-w"
            ),
            "username": "username"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
            expected_songs = [
                {
                    "sid": 2,
                    "username": "username",
                    "title": "A very test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:40 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6bnVsbCwidG90YWxfcGFnZXMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjF9.FapIICe8ZHTTHSzw_SxsD-L6iePSI47uX2_bOp7Kwjg',
                'current_page': 2,
                'next_page': None,
                'songs': expected_songs,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_compiled_songs')
    def test_get_compiled_songs_success_back_scroll_token_and_with_username(self, mocked_songs):
        """
        Ensure getting songs using a back page scroll token works with username also being defined.
        """
        test_song = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None, 8]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIxIiwidG90YWxfcGFnZ"
                "XMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjF9.68zZKI-AZX"
                "_OM2hq2p9LFHX1oWYWRpk3S08aiNUlX4A"
            ),
            "username": "username2"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
            expected_songs = [
                {
                    "sid": 1,
                    "username": "username",
                    "title": "A test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:39 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6bnVsbCwidG90YWxfcGFnZXMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjJ9.Q85alHs0LPZziERUTv0G4kUZeV2R5T9_4nYRi1ketBE',
                'songs': expected_songs,
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/compiled_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_compiled_songs')
    def test_get_compiled_songs_fail_no_scroll_token_exceeded_last_page(self, mocked_num_songs):
        """
        Ensure getting songs fails if the user tries to access a page that doesn't exist.
        """
        mocked_num_songs.return_value = 2
        test_req_data = {
            "current_page": 12,
            "posts_per_page": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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

    @mock.patch('backend.src.controllers.audio.controllers.get_song_data')
    def test_get_song_data_success(self, mocked_song):
        """
        Ensure user's can get a song's info successfully.
        """
        test_song = [[1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None, 8]]
        mocked_song.return_value = test_song
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
            expected_body = {'song': {'sid': 1, 'username': 'username', 'title': 'A test song', 'duration': 0, 'created': 'Wed, 13 Nov 2019 17:07:39 GMT', 'public': 1, 'url': None, 'cover': None, 'genre': None, 'likes': 8}}
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_song_data_fail_missing_sid(self):
        """
        Ensure user's can't get a song's info if they don't provide an sid.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
            self.assertEqual(401, res.status_code)

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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/song",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_all_editable_songs_by_uid')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_editable_songs_by_uid')
    def test_get_editable_songs_success_no_scroll_token_or_uid(self, mocked_num_songs, mocked_songs):
        """
        Ensure getting all editable songs for the current user is successful without scroll tokens.
        """
        test_songs = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None, 8],
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None, 8]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "/api/v1/audio/editable_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_songs = [
                {
                    "sid": 1,
                    "username": "username",
                    "title": "A test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:39 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                },
                {
                    "sid": 2,
                    "username": "username",
                    "title": "A very test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:40 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': None,
                'songs': expected_songs,
                'current_page': 1,
                'next_page': None,
                'songs_per_page': 50,
                'total_pages': 1
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_editable_songs_by_uid')
    def test_get_editable_songs_success_next_scroll_token_and_no_uid(self, mocked_songs):
        """
        Ensure getting editable songs for the current user is successful with a next page scroll token.
        """
        test_song = [
            [2, "username2", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None, 8]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlc"
                "yI6Miwic29uZ3NfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0"
                ".bNW1teHPVxJgLLi_2MHodcdC8djnsu-QU_9m_AE5Sfc"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "/api/v1/audio/editable_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_songs = [
                {
                    "sid": 2,
                    "username": "username2",
                    "title": "A very test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:40 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlcyI6Miwic29uZ3NfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.lPvUPb8m3ldR3tOfX26YQjMM1bczO05d4-vuuXarl90',
                'current_page': 2,
                'next_page': None,
                'songs': expected_songs,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_editable_songs_by_uid')
    def test_get_editable_songs_success_back_scroll_token_and_no_uid(self, mocked_songs):
        """
        Ensure getting editable songs for the current user is successful with a back page scroll token.
        """
        test_song = [
            [1, "username2", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None, 8]
        ]
        mocked_songs.return_value = test_song
        test_req_data = {
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlcy"
                "I6Miwic29uZ3NfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.l"
                "PvUPb8m3ldR3tOfX26YQjMM1bczO05d4-vuuXarl90"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "/api/v1/audio/editable_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_songs = [
                {
                    "sid": 1,
                    "username": "username2",
                    "title": "A test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:39 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlcyI6Miwic29uZ3NfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0.bNW1teHPVxJgLLi_2MHodcdC8djnsu-QU_9m_AE5Sfc',
                'songs': expected_songs,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_editable_songs_fail_missing_access_token(self):
        """
        Ensure getting editable songs fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/editable_songs",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_editable_songs_fail_access_token_expired(self):
        """
        Ensure getting editable songs fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/editable_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_editable_songs_fail_bad_access_token_signature(self):
        """
        Ensure getting editable songs fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/editable_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_editable_songs_fail_unknown_access_token_issue(self):
        """
        Ensure getting editable songs fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/editable_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_editable_songs_by_uid')
    def test_get_editable_songs_fail_no_scroll_token_exceeded_last_page(self, mocked_num_songs):
        """
        Ensure getting editable songs fails if the user tries to access a page that doesn't exist.
        """
        mocked_num_songs.return_value = 2
        test_req_data = {
            "current_page": 12,
            "posts_per_page": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "/api/v1/audio/editable_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_editable_songs_fail_sent_both_tokens(self):
        """
        Ensure getting editable songs fails if the user tries to send a next_page & back_page token.
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "/api/v1/audio/editable_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_user_via_username')
    @mock.patch('backend.src.controllers.audio.controllers.get_all_liked_songs_by_uid')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_liked_songs_by_uid')
    def test_get_liked_songs_success_with_username_and_no_scroll_token(self, mocked_num_songs, mocked_songs,
                                                                       mocked_user):
        """
        Ensure getting all liked songs for a specified username is successful without scroll tokens.
        """
        test_songs = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None, 8],
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None, 8]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        mocked_user.return_value = [[1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "username": "username"
            }
            res = self.test_client.get(
                "/api/v1/audio/liked_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_songs = [
                {
                    "sid": 1,
                    "username": "username",
                    "title": "A test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:39 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                },
                {
                    "sid": 2,
                    "username": "username",
                    "title": "A very test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:40 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': None,
                'songs': expected_songs,
                'current_page': 1,
                'next_page': None,
                'songs_per_page': 50,
                'total_pages': 1
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_user_via_username')
    @mock.patch('backend.src.controllers.audio.controllers.get_all_liked_songs_by_uid')
    def test_get_liked_songs_success_next_scroll_token_and_with_username(self, mocked_songs, mocked_user):
        """
        Ensure getting liked songs using a next page scroll token works with username also being defined.
        """
        test_song = [
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, None, 8]
        ]
        mocked_songs.return_value = test_song
        mocked_user.return_value = [[1]]
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIxIiwidG90YWxfcGFnZXMi"
                "OjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjJ9.FrBOO89SyKC5HVkN"
                "FFkRboBq3u4j129gTuvWnsGTy-w"
            ),
            "username": "username"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "/api/v1/audio/liked_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_songs = [
                {
                    "sid": 2,
                    "username": "username",
                    "title": "A very test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:40 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6bnVsbCwidG90YWxfcGFnZXMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjF9.FapIICe8ZHTTHSzw_SxsD-L6iePSI47uX2_bOp7Kwjg',
                'current_page': 2,
                'next_page': None,
                'songs': expected_songs,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_user_via_username')
    @mock.patch('backend.src.controllers.audio.controllers.get_all_liked_songs_by_uid')
    def test_get_liked_songs_success_back_scroll_token_and_with_username(self, mocked_songs, mocked_user):
        """
        Ensure getting liked songs using a back page scroll token works with username also being defined.
        """
        test_song = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, None, 8]
        ]
        mocked_user.return_value = [[1]]
        mocked_songs.return_value = test_song
        test_req_data = {
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIxIiwidG90YWxfcGFnZ"
                "XMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjF9.68zZKI-AZX"
                "_OM2hq2p9LFHX1oWYWRpk3S08aiNUlX4A"
            ),
            "username": "username2"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "/api/v1/audio/liked_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_songs = [
                {
                    "sid": 1,
                    "username": "username",
                    "title": "A test song",
                    "duration": 0,
                    "created": "Wed, 13 Nov 2019 17:07:39 GMT",
                    "public": 1,
                    "url": None,
                    "cover": None,
                    "genre": None,
                    "likes": 8
                }
            ]
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6bnVsbCwidG90YWxfcGFnZXMiOjIsInNvbmdzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjJ9.Q85alHs0LPZziERUTv0G4kUZeV2R5T9_4nYRi1ketBE',
                'songs': expected_songs,
                'songs_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_liked_songs_fail_missing_access_token(self):
        """
        Ensure getting liked songs fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/liked_songs",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_liked_songs_fail_access_token_expired(self):
        """
        Ensure getting liked songs fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/liked_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_liked_songs_fail_bad_access_token_signature(self):
        """
        Ensure getting liked songs fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/liked_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_liked_songs_fail_unknown_access_token_issue(self):
        """
        Ensure getting liked songs fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/liked_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_liked_songs_by_uid')
    def test_get_liked_songs_fail_no_scroll_token_exceeded_last_page(self, mocked_num_songs):
        """
        Ensure getting liked songs fails if the user tries to access a page that doesn't exist.
        """
        mocked_num_songs.return_value = 2
        test_req_data = {
            "current_page": 12,
            "posts_per_page": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "/api/v1/audio/liked_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_liked_songs_fail_sent_both_tokens(self):
        """
        Ensure getting liked songs fails if the user tries to send a next_page & back_page token.
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
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "/api/v1/audio/liked_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_like_pair')
    def test_like_success(self, mocked_likes):
        """
        Ensure liking is successful.
        """
        mocked_likes.return_value = []
        test_req_data = {
            "sid": 1,
        }
        with mock.patch("backend.src.controllers.audio.controllers.get_song_data"):
            with mock.patch("backend.src.controllers.audio.controllers.post_like"):
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
                        "/api/v1/audio/like",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {"message": "Song liked"}
                    self.assertEqual(expected_body, json.loads(res.data))

    def test_like_fail_missing_access_token(self):
        """
        Ensure likeing fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio/like",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_like_fail_access_token_expired(self):
        """
        Ensure likeing fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio/like",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_like_fail_bad_access_token_signature(self):
        """
        Ensure likeing fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio/like",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_like_fail_unknown_access_token_issue(self):
        """
        Ensure likeing fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/like",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_like_fail_missing_sid(self):
        """
        Ensure likeing fails if no sid is sent.
        """
        test_req_data = {}
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
                "/api/v1/audio/like",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": None,
            }
            res = self.test_client.post(
                "/api/v1/audio/like",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_unlike_success(self):
        """
        Ensure unliking is successful.
        """
        test_req_data = {
            "sid": 1,
        }
        with mock.patch("backend.src.controllers.audio.controllers.post_unlike"):
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
                    "/api/v1/audio/unlike",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {"message": "Song unliked"}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_unlike_fail_missing_access_token(self):
        """
        Ensure unlikeing fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio/unlike",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_unlike_fail_access_token_expired(self):
        """
        Ensure unlikeing fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio/unlike",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_unlike_fail_bad_access_token_signature(self):
        """
        Ensure unlikeing fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio/unlike",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_unlike_fail_unknown_access_token_issue(self):
        """
        Ensure unlikeing fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/unlike",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_unlike_fail_missing_sid(self):
        """
        Ensure unlikeing fails if no sid is sent.
        """
        test_req_data = {}
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
                "/api/v1/audio/unlike",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": None,
            }
            res = self.test_client.post(
                "/api/v1/audio/unlike",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_publish_success(self):
        """
        Ensure publish is successful.
        """
        test_req_data = {
            "sid": 1,
        }
        with mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit"):
            with mock.patch("backend.src.controllers.audio.controllers.update_published_status"):
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
                        "/api/v1/audio/publish",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {"message": "Song published."}
                    self.assertEqual(expected_body, json.loads(res.data))

    def test_publish_fail_missing_access_token(self):
        """
        Ensure publishing fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio/publish",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_publish_fail_access_token_expired(self):
        """
        Ensure publishing fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio/publish",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_publish_fail_bad_access_token_signature(self):
        """
        Ensure publishing fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio/publish",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_publish_fail_unknown_access_token_issue(self):
        """
        Ensure publishing fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/publish",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_publish_fail_missing_sid(self):
        """
        Ensure publishing fails if no sid is sent.
        """
        test_req_data = {}
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
                "/api/v1/audio/publish",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": None,
            }
            res = self.test_client.post(
                "/api/v1/audio/publish",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit")
    def test_publish_fail_not_permitted_to_edit(self, mocked_editor_check):
        """
        Ensure publishing a song fails if I don't have permission to edit the song.
        """
        test_req_data = {
            "sid": 1,
        }
        mocked_editor_check.return_value = False
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
                "/api/v1/audio/publish",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)
            expected_body = {"message": "You can't publish that song!"}
            self.assertEqual(expected_body, json.loads(res.data))

    def test_unpublish_success(self):
        """
        Ensure unpublish is successful.
        """
        test_req_data = {
            "sid": 1,
        }
        with mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit"):
            with mock.patch("backend.src.controllers.audio.controllers.update_published_status"):
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
                        "/api/v1/audio/unpublish",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {"message": "Song unpublished."}
                    self.assertEqual(expected_body, json.loads(res.data))

    def test_unpublish_fail_missing_access_token(self):
        """
        Ensure unpublishing fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio/unpublish",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_unpublish_fail_access_token_expired(self):
        """
        Ensure unpublishing fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio/unpublish",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_unpublish_fail_bad_access_token_signature(self):
        """
        Ensure unpublishing fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio/unpublish",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_unpublish_fail_unknown_access_token_issue(self):
        """
        Ensure unpublishing fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/unpublish",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_unpublish_fail_missing_sid(self):
        """
        Ensure unpublishing fails if no sid is sent.
        """
        test_req_data = {}
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
                "/api/v1/audio/unpublish",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": None,
            }
            res = self.test_client.post(
                "/api/v1/audio/unpublish",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit")
    def test_unpublish_fail_not_permitted_to_edit(self, mocked_editor_check):
        """
        Ensure unpublishing a song fails if I don't have permission to edit the song.
        """
        test_req_data = {
            "sid": 1,
        }
        mocked_editor_check.return_value = False
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
                "/api/v1/audio/unpublish",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)
            expected_body = {"message": "You can't publish that song!"}
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit")
    def test_patch_compiled_url_success(self, mocked_editor_check):
        """
        Ensure editing a URL for a compile song works.
        """
        test_req_data = {
            "url": "http://image.fake",
            "sid": 1,
            "duration": 1
        }
        mocked_editor_check.return_value = True
        with mock.patch('backend.src.controllers.audio.controllers.update_compiled_url'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = {
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
                res = self.test_client.patch(
                    "/api/v1/audio/compiled_url",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Compiled song URL updated.'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_patch_compiled_url_fail_missing_access_token(self):
        """
        Ensure patching a URL for a compiled song fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/audio/compiled_url",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_patch_compiled_url_fail_access_token_expired(self):
        """
        Ensure patching the URL for a compiled song fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_patch_compiled_url_fail_bad_access_token_signature(self):
        """
        Ensure patching the URL for a compiled song fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_compiled_url_fail_unknown_access_token_issue(self):
        """
        Ensure patching the URL for a compiled song fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_compiled_url_fail_missing_url(self):
        """
        Ensure patching the URL for a compiled song fails if the user doesn't send a URL.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "duration": 1
            }
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "url": "",
                "sid": 1,
                "duration": 1
            }
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_compiled_url_fail_bad_url(self):
        """
        Ensure patching the URL for a compiled song fails if the user doesn't send a valid URL.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "duration": 1,
                "url": "not a url string"
            }
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_compiled_url_fail_missing_sid(self):
        """
        Ensure patching the URL for a compiled song fails if the user doesn't send a sid.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "url": "http://fake.com",
                "duration": 1
            }
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "url": "http://fake.com",
                "sid": None,
                "duration": 1
            }
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_compiled_url_fail_bad_sid(self):
        """
        Ensure patching the URL for a compiled song fails if the user doesn't send a valid sid.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "sid": -1,
                "duration": 1,
                "url": "http://fake.com"
            }
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_compiled_url_fail_missing_duration(self):
        """
        Ensure patching the URL for a compiled song fails if the user doesn't send a duration.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "url": "http://fake.com",
                "sid": 1
            }
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "url": "http://fake.com",
                "duration": None,
                "sid": 1
            }
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_compiled_url_fail_bad_duration(self):
        """
        Ensure patching the URL for a compiled song fails if the user doesn't send a valid duration.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "duration": -1,
                "sid": 1,
                "url": "http://fake.com"
            }
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit")
    def test_patch_compiled_url_fail_not_permitted_to_edit(self, mocked_editor_check):
        """
        Ensure patching the URL for a compiled song fails if you don't have permission to edit the song.
        """
        test_req_data = {
            "sid": 1,
            "duration": 1,
            "url": "http://fake.com"
        }
        mocked_editor_check.return_value = False
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
            res = self.test_client.patch(
                "/api/v1/audio/compiled_url",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)
            expected_body = {"message": "You can't update that song!"}
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit")
    def test_patch_cover_art_success(self, mocked_editor_check):
        """
        Ensure editing a URL for a song's cover art works.
        """
        test_req_data = {
            "url": "http://image.fake",
            "sid": 1,
        }
        mocked_editor_check.return_value = True
        with mock.patch('backend.src.controllers.audio.controllers.update_cover_url'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = {
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
                res = self.test_client.patch(
                    "/api/v1/audio/cover_art",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Cover URL updated.'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_patch_cover_art_fail_missing_access_token(self):
        """
        Ensure patching a URL for a song's cover art fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/audio/cover_art",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_patch_cover_art_fail_access_token_expired(self):
        """
        Ensure patching the URL for a song's cover art fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_patch_cover_art_fail_bad_access_token_signature(self):
        """
        Ensure patching the URL for a song's cover art fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_cover_art_fail_unknown_access_token_issue(self):
        """
        Ensure patching the URL for a song's cover art fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_cover_art_fail_missing_url(self):
        """
        Ensure patching the URL for a song's cover art fails if the user doesn't send a URL.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
            }
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "url": "",
                "sid": 1,
            }
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_cover_art_fail_bad_url(self):
        """
        Ensure patching the URL for a song's cover art fails if the user doesn't send a valid URL.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "url": "not a url string"
            }
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_cover_art_fail_missing_sid(self):
        """
        Ensure patching the URL for a song's cover art fails if the user doesn't send a sid.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "url": "http://fake.com"
            }
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "url": "http://fake.com",
                "sid": None
            }
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_cover_art_fail_bad_sid(self):
        """
        Ensure patching the URL for a song's cover art fails if the user doesn't send a valid sid.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = {
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
                "sid": -1,
                "url": "http://fake.com"
            }
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit")
    def test_patch_cover_art_fail_not_permitted_to_edit(self, mocked_editor_check):
        """
        Ensure patching the URL for a song's cover art fails if you don't have permission to edit the song.
        """
        test_req_data = {
            "sid": 1,
            "url": "http://fake.com"
        }
        mocked_editor_check.return_value = False
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
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)
            expected_body = {"message": "You can't update that song!"}
            self.assertEqual(expected_body, json.loads(res.data))
