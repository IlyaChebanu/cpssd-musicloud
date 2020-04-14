# pylint: disable=C0302, C0301, R0904
"""
Test suite for /audio endpoints.
"""
import unittest
import json
import mock
import pytest

from jwt.exceptions import InvalidSignatureError

from ..src import APP
from ..src.models.errors import NoResults
from .constants import TEST_TOKEN, MOCKED_TOKEN, ALT_MOCKED_TOKEN


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
                mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                mock_token.return_value = ALT_MOCKED_TOKEN
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
        mocked_state.return_value = "{\"tempo\": 140, \"tracks\": []}"
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            expected_body = {'song_state': {'tempo': 140, 'tracks': []}}
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            [2, "username2", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0, "a description"]
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"]
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"],
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0, "a description"]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        mocked_user.return_value = [[1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0, "a description"]
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"]
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
        test_song = [[1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"]]
        mocked_song.return_value = test_song
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            expected_body = {'song': {'sid': 1, 'username': 'username', 'like_status': 0, 'title': 'A test song', 'duration': 0, 'created': 'Wed, 13 Nov 2019 17:07:39 GMT', 'public': 1, 'url': None, 'cover': None, 'likes': 8, 'description': 'a description'}}
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_song_data_fail_missing_sid(self):
        """
        Ensure user's can't get a song's info if they don't provide an sid.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"],
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0, "a description"]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            [2, "username2", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0, "a description"]
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            [1, "username2", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"]
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"],
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0, "a description"]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        mocked_user.return_value = [[1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0, "a description"]
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"]
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/liked_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch("backend.src.controllers.audio.controllers.get_song_data")
    @mock.patch('backend.src.controllers.audio.controllers.get_like_pair')
    def test_like_success(self, mocked_likes, mocked_song):
        """
        Ensure liking is successful.
        """
        mocked_likes.return_value = []
        mocked_song.return_value = [[None, None, "A Cool Tune"]]
        test_req_data = {
            "sid": 1,
        }
        with mock.patch("backend.src.controllers.audio.controllers.post_like"):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = MOCKED_TOKEN
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
            mock_token.return_value = MOCKED_TOKEN
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

    @mock.patch('backend.src.controllers.audio.controllers.get_song_data')
    def test_unlike_success(self, mocked_song):
        """
        Ensure unliking is successful.
        """
        test_req_data = {
            "sid": 1,
        }
        mocked_song.return_value = [[None, "A username"]]
        with mock.patch("backend.src.controllers.audio.controllers.post_unlike"):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = MOCKED_TOKEN
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
            mock_token.return_value = MOCKED_TOKEN
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

    @mock.patch('backend.src.controllers.audio.controllers.get_song_data')
    def test_publish_success(self, mocked_song):
        """
        Ensure publish is successful.
        """
        test_req_data = {
            "sid": 1,
        }
        mocked_song.return_value = [[None, None, "A Cool Tune"]]
        with mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit"):
            with mock.patch("backend.src.controllers.audio.controllers.update_published_status"):
                with mock.patch("backend.src.controllers.audio.controllers.update_publised_timestamp"):
                    with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                        mock_token.return_value = MOCKED_TOKEN
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
            mock_token.return_value = MOCKED_TOKEN
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
            mock_token.return_value = MOCKED_TOKEN
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
                    mock_token.return_value = MOCKED_TOKEN
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
            mock_token.return_value = MOCKED_TOKEN
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
            mock_token.return_value = MOCKED_TOKEN
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
                mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = MOCKED_TOKEN
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
                mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = ALT_MOCKED_TOKEN
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
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/audio/cover_art",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)
            expected_body = {"message": "You can't update that song!"}
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.create_playlist')
    def test_create_a_playlist_success(self, mocked_pid):
        """
        Ensure creating a playlist works.
        """
        test_req_data = {
            "title": "test"
        }
        mocked_pid.return_value = 1
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {'message': 'Playlist created', 'pid': 1}
            self.assertEqual(expected_body, json.loads(res.data))

    def test_create_a_playlist_fail_missing_access_token(self):
        """
        Ensure creating a playlist fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio/playlist",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_create_a_playlist_fail_access_token_expired(self):
        """
        Ensure creating a playlist fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_create_a_playlist_fail_bad_access_token_signature(self):
        """
        Ensure creating a playlist fails if the access_token signature does
        not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_create_a_playlist_fail_unknown_access_token_issue(self):
        """
        Ensure creating a playlist fails if some unknown error relating to the
        access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_create_a_playlist_fail_missing_title(self):
        """
        Ensure creating a playlist fails if a title is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/audio/playlist",
                json={},
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "title": ""
            }
            res = self.test_client.post(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_delete_my_playlist_success(self, mocked_uid):
        """
        Ensure deleting a playlist works.
        """
        test_req_data = {
            "pid": 1
        }
        mocked_uid.return_value = [[None, -1]]
        with mock.patch('backend.src.controllers.audio.controllers.delete_playlist_data'):
            with mock.patch('backend.src.controllers.audio.controllers.delete_playlist'):
                with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                    mock_token.return_value = ALT_MOCKED_TOKEN
                    res = self.test_client.delete(
                        "/api/v1/audio/playlist",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {'message': 'Playlist deleted'}
                    self.assertEqual(expected_body, json.loads(res.data))

    def test_delete_my_playlist_fail_missing_access_token(self):
        """
        Ensure deleting a playlist fails if no access_token is sent.
        """
        res = self.test_client.delete(
            "/api/v1/audio/playlist",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_delete_my_playlist_fail_access_token_expired(self):
        """
        Ensure deleting a playlist fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.delete(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_delete_my_playlist_fail_bad_access_token_signature(self):
        """
        Ensure deleting a playlist fails if the access_token signature does
        not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.delete(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_delete_my_playlist_fail_unknown_access_token_issue(self):
        """
        Ensure deleting a playlist fails if some unknown error relating to the
        access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.delete(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_delete_my_playlist_fail_missing_pid(self):
        """
        Ensure deleting a playlist fails if a pid is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.delete(
                "/api/v1/audio/playlist",
                json={},
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": None
            }
            res = self.test_client.delete(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_delete_my_playlist_fail_invalid_pid(self, mock_raise):
        """
        Ensure deleting a playlist fails if the pid sent is invalid.
        """
        test_req_data = {
            "pid": 1
        }
        mock_raise.side_effect = IndexError
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.delete(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_delete_my_playlist_fail_not_permitted(self, mock_uid):
        """
        Ensure deleting a playlist fails if the user is not permitted to edit
        the playlist.
        """
        test_req_data = {
            "pid": 1
        }
        mock_uid.return_value = [[None, 1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.delete(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlists')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_playlists')
    def test_get_my_playlists_success_no_scroll_token(self, mocked_num_playlists, mocked_playlists):
        """
        Ensure getting all playlists for the current user is successful without
        scroll tokens.
        """
        test_playlists = [
            [
                1,
                "Kamil",
                "A new title",
                "Fri, 29 Nov 2019 12:04:20 GMT",
                "Fri, 29 Nov 2019 16:30:30 GMT"
            ],
            [
                2,
                "Kamil",
                "A super duper very new title",
                "Fri, 29 Nov 2019 12:04:21 GMT",
                "Fri, 29 Nov 2019 16:30:31 GMT"
            ]
        ]
        mocked_num_playlists.return_value = 2
        mocked_playlists.return_value = test_playlists
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_playlists = [
                {
                    "created": "Fri, 29 Nov 2019 12:04:20 GMT",
                    "pid": 1,
                    "title": "A new title",
                    "updated": "Fri, 29 Nov 2019 16:30:30 GMT",
                    "username": "Kamil"
                },
                {
                    "created": "Fri, 29 Nov 2019 12:04:21 GMT",
                    "pid": 2,
                    "title": "A super duper very new title",
                    "updated": "Fri, 29 Nov 2019 16:30:31 GMT",
                    "username": "Kamil"
                }
            ]
            expected_body = {
                'back_page': None,
                'playlists': expected_playlists,
                'current_page': 1,
                'next_page': None,
                'playlists_per_page': 50,
                'total_pages': 1
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_playlists')
    def test_get_my_playlists_success_next_scroll_token(self, mocked_playlists):
        """
        Ensure getting all playlists for the current user is successful with a next page scroll token.
        """
        test_playlists = [
            [
                2,
                "Kamil",
                "A super duper very new title",
                "Fri, 29 Nov 2019 12:04:21 GMT",
                "Fri, 29 Nov 2019 16:30:31 GMT"
            ]
        ]
        mocked_playlists.return_value = test_playlists
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjdXJyZW50X3BhZ2UiOjIs"
                "InRvdGFsX3BhZ2VzIjoyLCJwbGF5bGlzdHNfcGVyX3BhZ2UiOjF9.6cfxATKM"
                "uNb3I2cOOY7GjwtKHRhqKqJQNa9cstcIxtc"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/playlist",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_playlist = [
                {
                    "created": "Fri, 29 Nov 2019 12:04:21 GMT",
                    "pid": 2,
                    "title": "A super duper very new title",
                    "updated": "Fri, 29 Nov 2019 16:30:31 GMT",
                    "username": "Kamil"
                }
            ]
            expected_body = {
                'back_page': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlcyI6MiwicGxheWxpc3RzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjF9.G8PqwN7lPAz3aesIEyQyeYabxWNYnOoKUoHnjNqUy5E",
                'current_page': 2,
                'next_page': None,
                'playlists': expected_playlist,
                'playlists_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_playlists')
    def test_get_my_playlists_success_back_scroll_token(self, mocked_playlists):
        """
        Ensure getting all playlists for the current user is successful with a back page scroll token.
        """
        test_playlist = [
            [
                1,
                "Kamil",
                "A new title",
                "Fri, 29 Nov 2019 12:04:20 GMT",
                "Fri, 29 Nov 2019 16:30:30 GMT"
            ]
        ]
        mocked_playlists.return_value = test_playlist
        test_req_data = {
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjdXJyZW50X3BhZ2UiOjEs"
                "InRvdGFsX3BhZ2VzIjoyLCJwbGF5bGlzdHNfcGVyX3BhZ2UiOjF9.VyWhw-jn"
                "2_TrczBkgIxSilEwIAM9OBQrAPZahLBxl48"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/playlist",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_playlist = [
                {
                    "created": "Fri, 29 Nov 2019 12:04:20 GMT",
                    "pid": 1,
                    "title": "A new title",
                    "updated": "Fri, 29 Nov 2019 16:30:30 GMT",
                    "username": "Kamil"
                }
            ]
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlcyI6MiwicGxheWxpc3RzX3Blcl9wYWdlIjoxLCJjdXJyZW50X3BhZ2UiOjJ9._rEtPtZw29cBFwrkhdO19YqaNpb4xW0FNlikcB3hYa4',
                'playlists': expected_playlist,
                'playlists_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_my_playlists_fail_missing_access_token(self):
        """
        Ensure getting a users playlists fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/playlist",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_my_playlists_fail_access_token_expired(self):
        """
        Ensure getting a users playlists fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_my_playlists_fail_bad_access_token_signature(self):
        """
        Ensure getting a users playlists fails if the access_token signature
        does not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_my_playlists_fail_unknown_access_token_issue(self):
        """
        Ensure getting a users playlists fails if some unknown error relating
        to the access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_playlists')
    def test_get_my_playlists_fail_no_scroll_token_exceeded_last_page(self, mocked_num_playlists):
        """
        Ensure getting a users playlists fails if the user tries to access a
        page that doesn't exist.
        """
        mocked_num_playlists.return_value = 2
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "current_page": 12,
                "songs_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/audio/playlist",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_my_playlists_fail_sent_both_tokens(self):
        """
        Ensure getting a users playlists fails if the user tries to send a
        next_page & back_page token.
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
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/playlist",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_rename_playlist_success(self, mocked_uid):
        """
        Ensure Renaming a playlist works.
        """
        test_req_data = {
            "pid": 1,
            "title": "title"
        }
        mocked_uid.return_value = [[None, -1]]
        with mock.patch('backend.src.controllers.audio.controllers.update_playlist_name'):
            with mock.patch('backend.src.controllers.audio.controllers.update_playlist_timestamp'):
                with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                    mock_token.return_value = ALT_MOCKED_TOKEN
                    res = self.test_client.patch(
                        "/api/v1/audio/playlist",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {'message': 'Playlist renamed'}
                    self.assertEqual(expected_body, json.loads(res.data))

    def test_rename_playlist_fail_missing_access_token(self):
        """
        Ensure Renaming a playlist fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/audio/playlist",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_rename_playlist_fail_access_token_expired(self):
        """
        Ensure renaming a playlist fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_rename_playlist_fail_bad_access_token_signature(self):
        """
        Ensure renaming a playlist fails if the access_token signature does
        not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_rename_playlist_fail_unknown_access_token_issue(self):
        """
        Ensure renaming a playlist fails if some unknown error relating to the
        access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_rename_playlist_fail_missing_pid(self):
        """
        Ensure renaming a playlist fails if a pid is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "pid": None,
                "title": "different title"
            }
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": None,
                "title": "different title"
            }
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_rename_playlist_fail_missing_title(self):
        """
        Ensure renaming a playlist fails if a title is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "pid": 1
            }
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": 1,
                "title": ""
            }
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_rename_playlist_fail_missing_title_and_pid(self):
        """
        Ensure renaming a playlist fails if a title and pid are not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                json={},
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": None,
                "title": ""
            }
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_rename_playlist_fail_invalid_pid(self, mock_raise):
        """
        Ensure renaming a playlist fails if the pid sent is invalid.
        """
        test_req_data = {
            "pid": 1,
            "title": "title"
        }
        mock_raise.side_effect = IndexError
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_rename_playlist_fail_not_permitted(self, mock_uid):
        """
        Ensure renaming a playlist fails if the user is not permitted to edit
        the playlist.
        """
        test_req_data = {
            "pid": 1,
            "title": "title"
        }
        mock_uid.return_value = [[None, 1]]
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/audio/playlist",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    @mock.patch('backend.src.controllers.audio.controllers.get_playlist_data')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_songs_in_playlist')
    def test_get_my_playlists_songs_success_no_scroll_token(self, mocked_num_songs, mocked_songs, mock_uid):
        """
        Ensure getting all the songs in a playlist is successful without scroll
        tokens.
        """
        test_songs = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"],
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0, "a description"]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        mock_uid.return_value = [[None, -1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "pid": 1
            }
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist_data')
    def test_get_my_playlists_songs_success_next_scroll_token(self, mocked_songs):
        """
        Ensure getting all the songs in a playlist is successful with a next page scroll token.
        """
        test_songs = [
            [2, "username", "A very test song", 0, "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0, "a description"]
        ]
        mocked_songs.return_value = test_songs
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwaWQiOjEsImN1cnJlbnRf"
                "cGFnZSI6MiwidG90YWxfcGFnZXMiOjMsInNvbmdzX3Blcl9wYWdlIjoxfQ.sA"
                "7IN_8VD3OcOMTToP6iqTwKX6iNljKhTVWrcFBUNpA"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
                }
            ]
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwaWQiOjEsInRvdGFsX3BhZ2VzIjozLCJzb25nc19wZXJfcGFnZSI6MSwiY3VycmVudF9wYWdlIjoxfQ.b-F2ekNAvBDT_-l8oqBWVn6ZSeI_S1Yqf61YeT300R4',
                'current_page': 2,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwaWQiOjEsInRvdGFsX3BhZ2VzIjozLCJzb25nc19wZXJfcGFnZSI6MSwiY3VycmVudF9wYWdlIjozfQ.lSJlboBm5mBfTUClYR_gkHDYhtAp-dxGcoXd8eqhjrc',
                'songs': expected_songs,
                'songs_per_page': 1,
                'total_pages': 3
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist_data')
    def test_get_my_playlists_songs_success_back_scroll_token(self, mocked_songs):
        """
        Ensure getting all the songs in a playlist is successful with a back page scroll token.
        """
        test_songs = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, None, None, 8, 0, "a description"]
        ]
        mocked_songs.return_value = test_songs
        test_req_data = {
            "back_page": (
                'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwaWQiOjEsImN1cnJlbnRf'
                'cGFnZSI6MSwidG90YWxfcGFnZXMiOjMsInNvbmdzX3Blcl9wYWdlIjoxfQ.cx'
                'LaMllmwj-uBnk7WqUc96HaziF-HQ7m_LWWkixQr5I'
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
                }
            ]
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwaWQiOjEsInRvdGFsX3BhZ2VzIjozLCJzb25nc19wZXJfcGFnZSI6MSwiY3VycmVudF9wYWdlIjoyfQ.-Kdo3fOKSO6s_ZQmP1w2Mn7_mJDdcDWvAh9fE_FD2i8",
                'songs': expected_songs,
                'songs_per_page': 1,
                'total_pages': 3
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_my_playlists_songs_fail_missing_access_token(self):
        """
        Ensure getting all the songs in a playlist fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/playlist_songs",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_my_playlists_songs_fail_access_token_expired(self):
        """
        Ensure getting all the songs in a playlist fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_my_playlists_songs_fail_bad_access_token_signature(self):
        """
        Ensure getting all the songs in a playlist fails if the access_token
        signature does not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_my_playlists_songs_fail_unknown_access_token_issue(self):
        """
        Ensure getting all the songs in a playlist fails if some unknown error
        relating to the access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_songs_in_playlist')
    def test_get_my_playlists_songs_fail_no_scroll_token_exceeded_last_page(self, mocked_num_songs, mock_uid):
        """
        Ensure getting all the songs in a playlist fails if the user tries to
        access a page that doesn't exist.
        """
        mocked_num_songs.return_value = 2
        mock_uid.return_value = [[None, -1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "pid": 1,
                "current_page": 12,
                "songs_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_my_playlists_songs_fail_sent_both_tokens(self):
        """
        Ensure getting all the songs in a playlist fails if the user tries to
        send a next_page & back_page token.
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
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_get_my_playlists_songs_fail_invalid_pid(self, mock_raise):
        """
        Ensure getting all the songs in a playlist fails if the pid sent is
        invalid.
        """
        test_req_data = {
            "pid": 1
        }
        mock_raise.side_effect = IndexError
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_songs_in_playlist')
    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_get_my_playlists_songs_fail_not_permitted(self, mock_uid, mocked_num_songs):
        """
        Ensure getting all the songs in a playlist fails if the user is not
        permitted to edit the playlist.
        """
        test_req_data = {
            "pid": 1
        }
        mock_uid.return_value = [[None, 1]]
        mocked_num_songs.return_value = 2
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_my_playlists_songs_fail_missing_pid(self):
        """
        Ensure getting all the songs in a playlist fails if a pid or scroll
        tokens are not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": None
            }
            res = self.test_client.get(
                "/api/v1/audio/playlist_songs",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_from_playlist')
    @mock.patch('backend.src.controllers.audio.controllers.get_song_data')
    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_add_song_to_playlist_success(self, mocked_uid, mocked_song_data, mocked_raise):
        """
        Ensure adding songs to a playlist works.
        """
        test_req_data = {
            "pid": 1,
            "sid": 1
        }
        mocked_uid.return_value = [[None, -1]]
        mocked_song_data.return_value = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, "http://fake.com", None, None, 8]
        ]
        mocked_raise.side_effect = NoResults
        with mock.patch('backend.src.controllers.audio.controllers.add_to_playlist'):
            with mock.patch('backend.src.controllers.audio.controllers.update_playlist_timestamp'):
                with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                    mock_token.return_value = ALT_MOCKED_TOKEN
                    res = self.test_client.post(
                        "/api/v1/audio/playlist_songs",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {'message': 'Song added'}
                    self.assertEqual(expected_body, json.loads(res.data))

    def test_add_song_to_playlist_fail_missing_access_token(self):
        """
        Ensure adding songs to a playlist fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio/playlist_songs",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_add_song_to_playlist_fail_access_token_expired(self):
        """
        Ensure adding songs to a playlist fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_add_song_to_playlist_fail_bad_access_token_signature(self):
        """
        Ensure adding songs to a playlist fails if the access_token signature
        does not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_add_song_to_playlist_fail_unknown_access_token_issue(self):
        """
        Ensure adding songs to a playlist fails if some unknown error relating
        to the access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_add_song_to_playlist_fail_missing_pid(self):
        """
        Ensure adding songs to a playlist fails if a pid is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "sid": 1
            }
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": None,
                "sid": 1
            }
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_add_song_to_playlist_fail_missing_sid(self):
        """
        Ensure adding songs to a playlist fails if a title is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "pid": 1
            }
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": 1,
                "sid": None
            }
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_add_song_to_playlist_fail_missing_sid_and_pid(self):
        """
        Ensure adding songs to a playlist fails if a title and pid are not
        sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                json={},
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": None,
                "sid": None
            }
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_add_song_to_playlist_fail_invalid_pid(self, mock_raise):
        """
        Ensure adding songs to a playlist fails if the pid sent is invalid.
        """
        test_req_data = {
            "pid": 1,
            "sid": 1
        }
        mock_raise.side_effect = IndexError
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_add_song_to_playlist_fail_not_permitted(self, mock_uid):
        """
        Ensure adding songs to a playlist fails if the user is not permitted to
        edit the playlist.
        """
        test_req_data = {
            "pid": 1,
            "sid": 1
        }
        mock_uid.return_value = [[None, 1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_song_data')
    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_add_song_to_playlist_fail_invalid_sid(self, mocked_uid, mocke_raise):
        """
        Ensure adding songs to a playlist fails if the sid sent is invalid.
        """
        test_req_data = {
            "pid": 1,
            "sid": 1
        }
        mocked_uid.return_value = [[None, -1]]
        mocke_raise.side_effect = NoResults
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_from_playlist')
    @mock.patch('backend.src.controllers.audio.controllers.get_song_data')
    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_add_song_to_playlist_fail_song_private(self, mock_uid, mocked_song_data, mocked_playlist_item):
        """
        Ensure adding songs to a playlist fails if the user is not permitted to
        edit the playlist.
        """
        test_req_data = {
            "pid": 1,
            "sid": 1
        }
        mock_uid.return_value = [[None, -1]]
        mocked_song_data.return_value = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT", 1, "http://fake.com", None, None, 8]
        ]
        mocked_playlist_item.return_value = [
            [1, 1]
        ]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_remove_song_from_playlist_success(self, mocked_uid):
        """
        Ensure removing songs from a playlist works.
        """
        test_req_data = {
            "pid": 1,
            "sid": 1
        }
        mocked_uid.return_value = [[None, -1]]
        with mock.patch('backend.src.controllers.audio.controllers.remove_from_playlist'):
            with mock.patch('backend.src.controllers.audio.controllers.update_playlist_timestamp'):
                with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                    mock_token.return_value = ALT_MOCKED_TOKEN
                    res = self.test_client.delete(
                        "/api/v1/audio/playlist_songs",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {'message': 'Song removed'}
                    self.assertEqual(expected_body, json.loads(res.data))

    def test_remove_song_from_playlist_fail_missing_access_token(self):
        """
        Ensure removing songs from a playlist fails if no access_token is sent.
        """
        res = self.test_client.delete(
            "/api/v1/audio/playlist_songs",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_remove_song_from_playlist_fail_access_token_expired(self):
        """
        Ensure removing songs from a playlist fails if the access_token is
        expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_remove_song_from_playlist_fail_bad_access_token_signature(self):
        """
        Ensure removing songs from a playlist fails if the access_token
        signature does not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_remove_song_from_playlist_fail_unknown_access_token_issue(self):
        """
        Ensure removing songs from a playlist fails if some unknown error
        relating to the access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_remove_song_from_playlist_fail_missing_pid(self):
        """
        Ensure removing songs from a playlist fails if a pid is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "sid": 1
            }
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": None,
                "sid": 1
            }
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_remove_song_from_playlist_fail_missing_sid(self):
        """
        Ensure removing songs from a playlist fails if a title is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "pid": 1
            }
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": 1,
                "sid": None
            }
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_remove_song_from_playlist_fail_missing_sid_and_pid(self):
        """
        Ensure removing songs from a playlist fails if a title and pid are not
        sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                json={},
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "pid": None,
                "sid": None
            }
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_remove_song_from_playlist_fail_invalid_pid(self, mock_raise):
        """
        Ensure removing songs from a playlist fails if the pid sent is invalid.
        """
        test_req_data = {
            "pid": 1,
            "sid": 1
        }
        mock_raise.side_effect = IndexError
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_playlist')
    def test_remove_song_from_playlist_fail_not_permitted(self, mock_uid):
        """
        Ensure removing songs from a playlist fails if the user is not
        permitted to edit the playlist.
        """
        test_req_data = {
            "pid": 1,
            "sid": 1
        }
        mock_uid.return_value = [[None, 1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.delete(
                "/api/v1/audio/playlist_songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_rename_song_success(self):
        """
        Ensure renaming a song is successful.
        """
        test_req_data = {
            "sid": 1,
            "title": "new title"
        }
        with mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit"):
            with mock.patch("backend.src.controllers.audio.controllers.update_song_name"):
                with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                    mock_token.return_value = MOCKED_TOKEN
                    res = self.test_client.patch(
                        "/api/v1/audio/rename",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {"message": "Song renamed"}
                    self.assertEqual(expected_body, json.loads(res.data))

    def test_rename_song_fail_missing_access_token(self):
        """
        Ensure renaming a song fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/audio/rename",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_rename_song_fail_access_token_expired(self):
        """
        Ensure renaming a song fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/audio/rename",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_rename_song_fail_bad_access_token_signature(self):
        """
        Ensure renaming a song fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/audio/rename",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_rename_song_fail_unknown_access_token_issue(self):
        """
        Ensure renaming a song fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/audio/rename",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_rename_song_fail_missing_sid(self):
        """
        Ensure renaming a song fails if no sid is sent.
        """
        test_req_data = {
            "title": "a title"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/audio/rename",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": None,
                "title": "a title"
            }
            res = self.test_client.patch(
                "/api/v1/audio/rename",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_rename_song_fail_missing_title(self):
        """
        Ensure renaming a song fails if no title is sent.
        """
        test_req_data = {
            "sid": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/audio/rename",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": 1,
                "title": ""
            }
            res = self.test_client.patch(
                "/api/v1/audio/rename",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_rename_song_fail_missing_sid_and_title(self):
        """
        Ensure renaming a song fails if no sid or title is sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/audio/rename",
                json={},
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": None,
                "title": ""
            }
            res = self.test_client.patch(
                "/api/v1/audio/rename",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit")
    def test_rename_song_fail_not_permitted_to_edit(self, mocked_editor_check):
        """
        Ensure renaming a song fails if I don't have permission to edit the song.
        """
        test_req_data = {
            "sid": 1,
            "title": "a new title"
        }
        mocked_editor_check.return_value = False
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/audio/rename",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    @mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit")
    def test_patch_description_success(self, mocked_editor_check):
        """
        Ensure editing a description for a song works.
        """
        test_req_data = {
            "description": "a description",
            "sid": 1,
        }
        mocked_editor_check.return_value = True
        with mock.patch('backend.src.controllers.audio.controllers.update_description'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.patch(
                    "/api/v1/audio/description",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Description updated.'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_patch_description_fail_missing_access_token(self):
        """
        Ensure patching a description for a song fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/audio/description",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_patch_description_fail_access_token_expired(self):
        """
        Ensure patching the description for a song fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/audio/description",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_patch_description_fail_bad_access_token_signature(self):
        """
        Ensure patching the description for a song fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/audio/description",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_description_fail_unknown_access_token_issue(self):
        """
        Ensure patching the description for a song fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/audio/description",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_description_fail_missing_description(self):
        """
        Ensure patching the description for a song fails if the user doesn't send a description.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "sid": 1,
            }
            res = self.test_client.patch(
                "/api/v1/audio/description",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "description": "",
                "sid": 1,
            }
            res = self.test_client.patch(
                "/api/v1/audio/description",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_description_fail_missing_sid(self):
        """
        Ensure patching the description for a song fails if the user doesn't send a sid.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "description": "a description"
            }
            res = self.test_client.patch(
                "/api/v1/audio/description",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "description": "a description",
                "sid": None
            }
            res = self.test_client.patch(
                "/api/v1/audio/description",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_description_fail_bad_sid(self):
        """
        Ensure patching the description for a song fails if the user doesn't send a valid sid.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "sid": -1,
                "description": "a description"
            }
            res = self.test_client.patch(
                "/api/v1/audio/description",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit")
    def test_patch_description_fail_not_permitted_to_edit(self, mocked_editor_check):
        """
        Ensure patching the description for a song fails if you don't have permission to edit the song.
        """
        test_req_data = {
            "sid": 1,
            "description": "a description"
        }
        mocked_editor_check.return_value = False
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/audio/description",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)
            expected_body = {"message": "You can't update that song!"}
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch("backend.src.controllers.audio.controllers.permitted_to_edit")
    def test_delete_song_success(self, mocked_editor_check):
        """
        Ensure deleting a song works.
        """
        test_req_data = {
            "sid": 1
        }
        mocked_editor_check.return_value = True
        with mock.patch('backend.src.controllers.audio.controllers.delete_song_data'):
            with mock.patch('backend.src.controllers.audio.controllers.get_song_data'):
                with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                    mock_token.return_value = ALT_MOCKED_TOKEN
                    res = self.test_client.delete(
                        "/api/v1/audio",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {'message': 'Song deleted'}
                    self.assertEqual(expected_body, json.loads(res.data))

    def test_delete_song_fail_missing_access_token(self):
        """
        Ensure deleting a song fails if no access_token is sent.
        """
        res = self.test_client.delete(
            "/api/v1/audio",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_delete_song_fail_access_token_expired(self):
        """
        Ensure deleting a song fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.delete(
                "/api/v1/audio",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_delete_song_fail_bad_access_token_signature(self):
        """
        Ensure deleting a song fails if the access_token signature does
        not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.delete(
                "/api/v1/audio",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_delete_song_fail_unknown_access_token_issue(self):
        """
        Ensure deleting a song fails if some unknown error relating to the
        access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.delete(
                "/api/v1/audio",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_delete_song_fail_missing_sid(self):
        """
        Ensure deleting a song fails if a sid is not sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.delete(
                "/api/v1/audio",
                json={},
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "sid": None
            }
            res = self.test_client.delete(
                "/api/v1/audio",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_song_data')
    def test_delete_song_fail_invalid_sid(self, mock_raise):
        """
        Ensure deleting a song fails if the sid sent is invalid.
        """
        test_req_data = {
            "sid": 1
        }
        mock_raise.side_effect = NoResults
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.delete(
                "/api/v1/audio",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(400, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.permitted_to_edit')
    def test_delete_song_fail_not_permitted(self, mock_uid):
        """
        Ensure deleting a playlist fails if the user is not permitted to edit
        the playlist.
        """
        test_req_data = {
            "sid": 1
        }
        mock_uid.return_value = False
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            with mock.patch('backend.src.controllers.audio.controllers.get_song_data'):
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.delete(
                    "/api/v1/audio",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_all_search_results')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_searchable_songs')
    def test_get_search_success_no_scroll_token(self, mocked_num_songs, mocked_songs):
        """
        Ensure searching for songs is successful without scroll tokens.
        """
        test_songs = [
            [1, "username", "A test song", 0, "Wed, 13 Nov 2019 17:07:39 GMT",
             1, None, None, 8, 0, "a description"]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_songs
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/search?search_term=fakeSearch",
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
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

    @mock.patch('backend.src.controllers.audio.controllers.get_all_search_results')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_searchable_songs')
    def test_get_search_success_next_scroll_token(self, mocked_num_songs, mocked_songs):
        """
        Ensure searching for songs is successful with a next page scroll token.
        """
        test_song = [
            [2, "username2", "A very test song", 0,
             "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0,
             "a description"]
        ]
        mocked_num_songs.return_value = 2
        mocked_songs.return_value = test_song
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzZWFyY2hfdGVybSI6InRl"
                "c3QiLCJzb3J0X3NxbCI6IiBPUkRFUiBCWSBkdXJhdGlvbiBBU0MgIiwidG90Y"
                "WxfcGFnZXMiOjIxLCJzb25nc19wZXJfcGFnZSI6NTAsImN1cnJlbnRfcGFnZS"
                "I6M30.OBCFnHwAZRjhwZEkJAPvaRqAA7GxMP76ZlcpCGcazBI"
            ),
            "search_term": "fakeSearch"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/search",
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
                }
            ]
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzZWFyY2hfdGVybSI6InRlc3QiLCJzb3J0X3NxbCI6IiBPUkRFUiBCWSBkdXJhdGlvbiBBU0MgIiwidG90YWxfcGFnZXMiOjIxLCJwcm9maWxlX3NlYXJjaCI6bnVsbCwic29uZ3NfcGVyX3BhZ2UiOjUwLCJjdXJyZW50X3BhZ2UiOjJ9.G1ohS2qgUPUiqgLq2F82yod_1vdGp_NZka2_OZwMSMU',
                'current_page': 3,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzZWFyY2hfdGVybSI6InRlc3QiLCJzb3J0X3NxbCI6IiBPUkRFUiBCWSBkdXJhdGlvbiBBU0MgIiwidG90YWxfcGFnZXMiOjIxLCJwcm9maWxlX3NlYXJjaCI6bnVsbCwic29uZ3NfcGVyX3BhZ2UiOjUwLCJjdXJyZW50X3BhZ2UiOjR9.aNc5EDcv3TGLb67VXgFEx0Q_e4nvQWZI3PbMAfaz9nc',
                'songs': expected_songs,
                'songs_per_page': 50,
                'total_pages': 21
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.audio.controllers.get_all_search_results')
    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_searchable_songs')
    def test_get_search_success_back_scroll_token(self, mocked_num_songs, mocked_songs):
        """
        Ensure searching for songs is successful with a back page scroll token.
        """
        test_song = [
            [2, "username2", "A very test song", 0,
             "Wed, 13 Nov 2019 17:07:40 GMT", 1, None, None, 8, 0,
             "a description"]
        ]
        mocked_songs.return_value = test_song
        mocked_num_songs.return_value = 2
        test_req_data = {
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzZWFyY2hfdGVybSI6InRl"
                "c3QiLCJzb3J0X3NxbCI6IiBPUkRFUiBCWSBkdXJhdGlvbiBBU0MgIiwidG90Y"
                "WxfcGFnZXMiOjIxLCJzb25nc19wZXJfcGFnZSI6NTAsImN1cnJlbnRfcGFnZS"
                "I6Mn0.iILstA3UP8PZ_DkAjWoDqE8YJfiElEhCCNhm9rg7wR0"
            ),
            "search_term": "fakeSearch"
        }
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/search",
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
                    "likes": 8,
                    "like_status": 0,
                    "description": "a description"
                }
            ]
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzZWFyY2hfdGVybSI6InRlc3QiLCJzb3J0X3NxbCI6IiBPUkRFUiBCWSBkdXJhdGlvbiBBU0MgIiwidG90YWxfcGFnZXMiOjIxLCJwcm9maWxlX3NlYXJjaCI6bnVsbCwic29uZ3NfcGVyX3BhZ2UiOjUwLCJjdXJyZW50X3BhZ2UiOjF9.sm9O8YA5bjSXXJDcduWOuYxrPgUVeqzud_AyIUPMXN0',
                'current_page': 2,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzZWFyY2hfdGVybSI6InRlc3QiLCJzb3J0X3NxbCI6IiBPUkRFUiBCWSBkdXJhdGlvbiBBU0MgIiwidG90YWxfcGFnZXMiOjIxLCJwcm9maWxlX3NlYXJjaCI6bnVsbCwic29uZ3NfcGVyX3BhZ2UiOjUwLCJjdXJyZW50X3BhZ2UiOjN9.0YLsVccpDToQny2P3Qr9PkAosaIRWV0M3awmHSoFpsw',
                'songs': expected_songs,
                'songs_per_page': 50,
                'total_pages': 21
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_search_fail_missing_access_token(self):
        """
        Ensure searching for songs fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/search?search_term=fakeSearch",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_search_fail_access_token_expired(self):
        """
        Ensure searching for songs fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/search?search_term=fakeSearch",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_search_fail_bad_access_token_signature(self):
        """
        Ensure searching for songs fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/search?search_term=fakeSearch",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_search_fail_unknown_access_token_issue(self):
        """
        Ensure searching for songs fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/search?search_term=fakeSearch",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_number_of_searchable_songs')
    def test_get_search_fail_no_scroll_token_exceeded_last_page(self, mocked_num_songs):
        """
        Ensure searching for songs fails if the user tries to access a page that doesn't exist.
        """
        mocked_num_songs.return_value = 2
        test_req_data = {
            "current_page": 12,
            "posts_per_page": 1,
            "search_term": "fakeSearch"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/search",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_search_fail_sent_both_tokens(self):
        """
        Ensure searching for songs fails if the user tries to send a next_page & back_page token.
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
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/search",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_child_files')
    @mock.patch('backend.src.controllers.audio.controllers.get_child_folders')
    @mock.patch('backend.src.controllers.audio.controllers.get_folder_entry')
    def test_get_folder_success(self, mock_folder, mock_child_folders, mock_child_files):
        """
        Ensure getting a folder is successful.
        """
        mock_folder.return_value = [[1, None, "A Folder"]]
        mock_child_folders.return_value = []
        mock_child_files.return_value = []
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/folders",
                query_string={"folder_id": 1},
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                "folder": {
                    "child_files":[],
                    "child_folders": [],
                    "folder_id": 1,
                    "folder_name": "A Folder"
                }
            }
            self.assertEqual(expected_body, json.loads(res.data))


    def test_get_folder_fail_missing_access_token(self):
        """
        Ensure getting a folder fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/folders",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_folder_fail_access_token_expired(self):
        """
        Ensure getting a folder fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_folder_fail_bad_access_token_signature(self):
        """
        Ensure getting a folder fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_folder_fail_unknown_access_token_issue(self):
        """
        Ensure getting a folder fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_creating_a_folder_success(self):
        """
        Ensure creating a folder is successful.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            with mock.patch('backend.src.controllers.audio.controllers.get_folder_entry'):
                with mock.patch('backend.src.controllers.audio.controllers.create_folder_entry'):
                    mock_token.return_value = ALT_MOCKED_TOKEN
                    res = self.test_client.post(
                        "/api/v1/audio/folders",
                        json={"folder_name": "name", "parent_folder_id": 1},
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    self.assertEqual({"message": "Folder created"}, json.loads(res.data))

    def test_creating_a_folder_fail_missing_access_token(self):
        """
        Ensure creating a folder fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio/folders",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_creating_a_folder_fail_access_token_expired(self):
        """
        Ensure creating a folder fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_creating_a_folder_fail_bad_access_token_signature(self):
        """
        Ensure creating a folder fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_creating_a_folder_fail_unknown_access_token_issue(self):
        """
        Ensure creating a folder fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_root_folder_entry')
    def test_deleting_a_folder_success(self, mock_root):
        """
        Ensure deleting a folder is successful.
        """
        mock_root.side_effect = NoResults
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            with mock.patch('backend.src.controllers.audio.controllers.delete_folder_entry'):
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.delete(
                    "/api/v1/audio/folders",
                    query_string={"folder_id": 1},
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                self.assertEqual({"message": "Folder deleted"}, json.loads(res.data))

    def test_deleting_a_folder_fail_missing_access_token(self):
        """
        Ensure deleting a folder fails if no access_token is sent.
        """
        res = self.test_client.delete(
            "/api/v1/audio/folders",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_deleting_a_folder_fail_access_token_expired(self):
        """
        Ensure deleting a folder fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.delete(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_deleting_a_folder_fail_bad_access_token_signature(self):
        """
        Ensure deleting a folder fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.delete(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_deleting_a_folder_fail_unknown_access_token_issue(self):
        """
        Ensure deleting a folder fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.delete(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch(
        'backend.src.controllers.audio.controllers.get_root_folder_entry')
    def test_moving_a_folder_success(self, mock_root):
        """
        Ensure moving a folder is successful.
        """
        mock_root.side_effect = NoResults
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            with mock.patch('backend.src.controllers.audio.controllers.move_folder_entry'):
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.patch(
                    "/api/v1/audio/folders",
                    query_string={"folder_id": 2, "parent_folder_id": 1},
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                self.assertEqual({"message": "Folder moved"}, json.loads(res.data))

    def test_moving_a_folder_fail_missing_access_token(self):
        """
        Ensure moving a folder fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/audio/folders",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_moving_a_folder_fail_access_token_expired(self):
        """
        Ensure moving a folder fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_moving_a_folder_fail_bad_access_token_signature(self):
        """
        Ensure moving a folder fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_moving_a_folder_fail_unknown_access_token_issue(self):
        """
        Ensure moving a folder fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/audio/folders",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_creating_a_file_success(self):
        """
        Ensure creating a file is successful.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            with mock.patch('backend.src.controllers.audio.controllers.get_folder_entry'):
                with mock.patch('backend.src.controllers.audio.controllers.add_sample'):
                    mock_token.return_value = ALT_MOCKED_TOKEN
                    res = self.test_client.post(
                        "/api/v1/audio/files",
                        json={"file_name": "name", "file_url": "http://afakeurl.com", "folder_id": 1},
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    self.assertEqual({"message": "File added to folder"}, json.loads(res.data))

    def test_creating_a_file_fail_missing_access_token(self):
        """
        Ensure creating a file fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio/files",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_creating_a_file_fail_access_token_expired(self):
        """
        Ensure creating a file fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio/files",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_creating_a_file_fail_bad_access_token_signature(self):
        """
        Ensure creating a file fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio/files",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_creating_a_file_fail_unknown_access_token_issue(self):
        """
        Ensure creating a file fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/files",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_deleting_a_file_success(self):
        """
        Ensure deleting a file is successful.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            with mock.patch('backend.src.controllers.audio.controllers.delete_file_entry'):
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.delete(
                    "/api/v1/audio/files",
                    query_string={"file_id": 1},
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                self.assertEqual({"message": "File deleted"}, json.loads(res.data))

    def test_deleting_a_file_fail_missing_access_token(self):
        """
        Ensure deleting a file fails if no access_token is sent.
        """
        res = self.test_client.delete(
            "/api/v1/audio/files",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_deleting_a_file_fail_access_token_expired(self):
        """
        Ensure deleting a file fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.delete(
                "/api/v1/audio/files",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_deleting_a_file_fail_bad_access_token_signature(self):
        """
        Ensure deleting a file fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.delete(
                "/api/v1/audio/files",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_deleting_a_file_fail_unknown_access_token_issue(self):
        """
        Ensure deleting a file fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.delete(
                "/api/v1/audio/files",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_moving_a_file_success(self):
        """
        Ensure moving a file is successful.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            with mock.patch('backend.src.controllers.audio.controllers.move_file_entry'):
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.patch(
                    "/api/v1/audio/files",
                    query_string={"file_id": 2, "folder_id": 1},
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                self.assertEqual({"message": "File moved"}, json.loads(res.data))

    def test_moving_a_file_fail_missing_access_token(self):
        """
        Ensure moving a file fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/audio/files",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_moving_a_file_fail_access_token_expired(self):
        """
        Ensure moving a file fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/audio/files",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_moving_a_file_fail_bad_access_token_signature(self):
        """
        Ensure moving a file fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/audio/files",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_moving_a_file_fail_unknown_access_token_issue(self):
        """
        Ensure moving a file fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/audio/files",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_all_synths')
    def test_get_synths_success(self, mocked_synths):
        """
        Ensure getting synths is successful.
        """
        mocked_synths.return_value = []
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {"synths": []}
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_synths_fail_missing_access_token(self):
        """
        Ensure getting synths fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/audio/synth",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_synths_fail_access_token_expired(self):
        """
        Ensure getting synths fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_synths_fail_bad_access_token_signature(self):
        """
        Ensure getting synths fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_synths_fail_unknown_access_token_issue(self):
        """
        Ensure getting synths fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.add_synth')
    def test_post_synth_success(self, mock_synth_id):
        """
        Ensure creating a synth is successful.
        """
        mock_synth_id.return_value = 1
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/audio/synth",
                json={'name': 'Piano'},
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {'message': 'Synth created', 'synth_id': 1}
            self.assertEqual(expected_body, json.loads(res.data))

    def test_post_synth_fail_missing_access_token(self):
        """
        Ensure posting a synth fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/audio/synth",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_post_synth_fail_access_token_expired(self):
        """
        Ensure posting a synth fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_post_synth_fail_bad_access_token_signature(self):
        """
        Ensure posting a synth fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_post_synth_fail_unknown_access_token_issue(self):
        """
        Ensure posting a synth fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @pytest.mark.skip(reason="Broken in Travis only")
    @mock.patch('backend.src.controllers.audio.controllers.get_synth')
    @mock.patch('backend.src.controllers.audio.controllers.json.loads')
    def test_edit_synths_success(self, mocked_patch, mocked_synth):
        """
        Ensure editing synths is successful.
        """
        mocked_patch.return_value = {}
        mocked_synth.return_value = [[None, -1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            with mock.patch('backend.src.controllers.audio.controllers.update_synth'):
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.patch(
                    "/api/v1/audio/synth?id=-1",
                    json={"patch": {"attack": 200}},
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)

    def test_edit_synths_fail_missing_access_token(self):
        """
        Ensure editing synths fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/audio/synth",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_edit_synths_fail_access_token_expired(self):
        """
        Ensure editing synths fails if the access_token is expired.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_edit_synths_fail_bad_access_token_signature(self):
        """
        Ensure editing synths fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_edit_synths_fail_unknown_access_token_issue(self):
        """
        Ensure editing synths fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.audio.controllers.get_synth')
    def test_delete_synths_success(self, mocked_synth):
        """
        Ensure deleting synths is successful.
        """
        mocked_synth.return_value = [[None, -1]]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            with mock.patch('backend.src.controllers.audio.controllers.delete_synth_entry'):
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.delete(
                    "/api/v1/audio/synth",
                    query_string={"id": -1},
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)

    def test_delete_synths_fail_missing_access_token(self):
        """
        Ensure deleting synths fails if no access_token is sent.
        """
        res = self.test_client.delete(
            "/api/v1/audio/synth",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_delete_synths_fail_access_token_expired(self):
        """
        Ensure deleting synths fails if the access_token is expired.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.delete(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_delete_synths_fail_bad_access_token_signature(self):
        """
        Ensure deleting synths fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.delete(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_delete_synths_fail_unknown_access_token_issue(self):
        """
        Ensure deleting synths fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.delete(
                "/api/v1/audio/synth",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)
