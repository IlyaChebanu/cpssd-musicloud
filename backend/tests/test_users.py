# pylint: disable=C0302, C0301, R0904
"""
Test suite for /users endpoints.
"""
import unittest
import datetime
import json
import mock

from mysql.connector.errors import IntegrityError
from jwt.exceptions import InvalidSignatureError
from argon2.exceptions import VerifyMismatchError

from ..src import APP
from ..src.models.errors import NoResults
from .constants import TEST_TOKEN, MOCKED_TOKEN, ALT_MOCKED_TOKEN


class UserTests(unittest.TestCase):
    """
    Unit tests for /users API endpoints.
    """
    def setUp(self):
        self.test_client = APP.test_client(self)

    @mock.patch(
        'backend.src.controllers.users.controllers.get_user_via_username'
    )
    def test_registration_success(self, uid_mock):
        """
        Ensure user's can register correctly.
        """
        uid_mock.return_value = [[0]]
        test_req_data = {
            "username": "username",
            "email": "username@fakemail.noshow",
            "password": "1234"
        }
        with mock.patch(
                "backend.src.controllers.users.controllers.insert_verification"
        ):
            with mock.patch(
                    'backend.src.controllers.users.controllers.insert_user'
            ):
                with mock.patch(
                        'backend.src.controllers.users.controllers.send_mail'
                ):
                    res = self.test_client.post(
                        "/api/v1/users",
                        json=test_req_data,
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {"message": "User created!"}
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
        with mock.patch('backend.src.controllers.users.controllers.insert_user') as file:
            file.side_effect = IntegrityError()
            res = self.test_client.post(
                "/api/v1/users",
                json=test_req_data,
                follow_redirects=True
            )
        self.assertEqual(409, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_email')
    def test_reverify_success(self, mocked_user):
        """
        Ensure resending of the verification email is working.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        test_req_data = {
            "email": "username@fakemail.noshow",
        }
        with mock.patch('backend.src.controllers.users.controllers.send_mail'):
            with mock.patch('backend.src.controllers.users.controllers.insert_verification'):
                res = self.test_client.post(
                    "/api/v1/users/reverify",
                    json=test_req_data,
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {"message": "Verification email sent."}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_reverify_fail_missing_email(self):
        """
        Ensure verification emails aren't resent if an email address is not provided.
        """
        test_req_data = {}
        res = self.test_client.post(
            "/api/v1/users/reverify",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "email": ""
        }
        res = self.test_client.post(
            "/api/v1/users/reverify",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_reverify_fail_invalid_email(self):
        """
        Ensure verification emails aren't resent if an email address is invalid.
        """
        test_req_data = {
            "email": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users/reverify",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_email')
    def test_reverify_fail_already_verified(self, mocked_user):
        """
        Ensure verification emails aren't resent if the user is already verified.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 1, "http://image.fake"]]
        test_req_data = {
            "email": "username@fakemail.noshow",
        }
        res = self.test_client.post(
            "/api/v1/users/reverify",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(403, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    @mock.patch('backend.src.controllers.users.controllers.get_following_pair')
    def test_follow_success(self, mocked_followers, mocked_user):
        """
        Ensure following is successful.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_followers.return_value = []
        test_req_data = {
            "username": "username",
        }
        with mock.patch("backend.src.controllers.users.controllers.post_follow"):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = MOCKED_TOKEN
                res = self.test_client.post(
                    "/api/v1/users/follow",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {"message": "You are now following: username"}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_follow_fail_missing_access_token(self):
        """
        Ensure following fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/users/follow",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_follow_fail_access_token_expired(self):
        """
        Ensure following fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/users/follow",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_follow_fail_bad_access_token_signature(self):
        """
        Ensure following fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/users/follow",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_follow_fail_unknown_access_token_issue(self):
        """
        Ensure following fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/users/follow",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_follow_fail_missing_username(self):
        """
        Ensure following fails if no username is sent.
        """
        test_req_data = {}
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/users/follow",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "username": "",
            }
            res = self.test_client.post(
                "/api/v1/users/follow",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_follow_fail_bad_username(self, mocked_user):
        """
        Ensure following fails if a user provides a basd username.
        """
        mocked_user.side_effect = NoResults
        test_req_data = {
            "username": "iDon'tExist'",
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/users/follow",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
        self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_follow_fail_self_follow(self, mocked_user):
        """
        Ensure following fails if a user attempts to follow themselves.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        test_req_data = {
            "username": "username",
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/users/follow",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
        self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    @mock.patch('backend.src.controllers.users.controllers.get_following_pair')
    def test_unfollow_success(self, mocked_followers, mocked_user):
        """
        Ensure unfollowing is successful.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_followers.return_value = []
        test_req_data = {
            "username": "username",
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/users/unfollow",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {"message": "You are now no longer following: username"}
            self.assertEqual(expected_body, json.loads(res.data))

    def test_unfollow_fail_missing_access_token(self):
        """
        Ensure unfollowing fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/users/unfollow",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_unfollow_fail_access_token_expired(self):
        """
        Ensure unfollowing fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/users/unfollow",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_unfollow_fail_bad_access_token_signature(self):
        """
        Ensure unfollowing fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/users/unfollow",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_unfollow_fail_unknown_access_token_issue(self):
        """
        Ensure unfollowing fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/users/unfollow",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_unfollow_fail_missing_username(self):
        """
        Ensure unfollowing fails if no username is sent.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            test_req_data = {}
            res = self.test_client.post(
                "/api/v1/users/unfollow",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "username": "",
            }
            res = self.test_client.post(
                "/api/v1/users/unfollow",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_unfollow_fail_bad_username(self, mocked_user):
        """
        Ensure unfollowing fails if a user sends a nonexistent username.
        """
        mocked_user.side_effect = NoResults
        test_req_data = {
            "username": "iDon'tExist'",
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.post(
                "/api/v1/users/unfollow",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
        self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_following_pair')
    @mock.patch('backend.src.controllers.users.controllers.get_follower_count')
    @mock.patch('backend.src.controllers.users.controllers.get_following_count')
    @mock.patch('backend.src.controllers.users.controllers.get_song_count')
    @mock.patch('backend.src.controllers.users.controllers.get_number_of_posts')
    @mock.patch('backend.src.controllers.users.controllers.get_number_of_likes')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_user_success(self, mocked_user, likes, posts, songs, following, follower, follow_status):  # pylint: disable=R0913
        """
        Ensure getting a user's info is successful.
        """
        likes.return_value = 5
        posts.return_value = 4
        songs.return_value = 3
        following.return_value = 2
        follower.return_value = 1
        follow_status.return_value = []
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        test_req_data = {
            "username": "username",
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'followers': 1,
                'following': 2,
                'follow_status': 0,
                'likes': 5,
                'follow_notification_status': 0,
                'post_notification_status': 0,
                'song_notification_status': 0,
                'like_notification_status': 0,
                'posts': 4,
                'profile_pic_url': 'http://image.fake',
                'songs': 3,
                'username': 'username'
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_user_fail_missing_access_token(self):
        """
        Ensure getting a user's info fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/users",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_user_fail_access_token_expired(self):
        """
        Ensure getting a user's info fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/users",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_user_fail_bad_access_token_signature(self):
        """
        Ensure getting a user's info fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/users",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_user_fail_unknown_access_token_issue(self):
        """
        Ensure getting a user's info fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/users",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_user_fails_no_username(self,):
        """
        Ensure getting a user's info fails if no username is provided.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            test_req_data = {}
            res = self.test_client.get(
                "/api/v1/users",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "username": ""
            }
            res = self.test_client.get(
                "/api/v1/users",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_user_fail_bad_username(self, mocked_user):
        """
        Ensure getting a user's info fails if a user sends a nonexistent username.
        """
        mocked_user.side_effect = NoResults
        test_req_data = {
            "username": "iDon'tExist'",
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
        self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_email')
    def test_get_reset_success(self, mocked_user):
        """
        Ensure sending password reset email works successfully.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        test_req_data = {
            "email": "fakeemail@idontwork.biz",
        }
        with mock.patch('backend.src.controllers.users.controllers.create_reset'):
            with mock.patch('backend.src.controllers.users.controllers.update_reset'):
                with mock.patch('backend.src.controllers.users.controllers.send_mail'):
                    res = self.test_client.get(
                        "/api/v1/users/reset",
                        query_string=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {'message': 'Email sent.'}
                    self.assertEqual(expected_body, json.loads(res.data))

    def test_get_reset_fails_missing_email(self):
        """
        Ensure sending password reset email fails if an email is not sent.
        """
        test_req_data = {}
        res = self.test_client.get(
            "/api/v1/users/reset",
            query_string=test_req_data,
            headers={'Authorization': 'Bearer ' + TEST_TOKEN},
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "email": "",
        }
        res = self.test_client.get(
            "/api/v1/users/reset",
            query_string=test_req_data,
            headers={'Authorization': 'Bearer ' + TEST_TOKEN},
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_get_reset_fails_bad_email(self):
        """
        Ensure sending password reset email fails if the email sent
        does not comply with the email address format.
        """
        test_req_data = {
            "email": "notAnEmail",
        }
        res = self.test_client.get(
            "/api/v1/users/reset",
            query_string=test_req_data,
            headers={'Authorization': 'Bearer ' + TEST_TOKEN},
            follow_redirects=True
        )
        self.assertEqual(400, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_email')
    def test_get_reset_fail_bad_username(self, mocked_user):
        """
        Ensure sending password reset email fails if the user we are requesting
        it for doesn't exist.
        """
        mocked_user.side_effect = NoResults
        test_req_data = {
            "email": "bademail@void.com",
        }
        res = self.test_client.get(
            "/api/v1/users/reset",
            query_string=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_reset_request')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_email')
    def test_password_reset_success(self, mocked_user, mocked_reset):
        """
        Ensure password resets are completed successfully.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_reset.return_value = [["-1", 10000000, datetime.datetime.utcnow()]]
        test_req_data = {
            "email": "username@fakemail.noshow",
            "password": "1234",
            "code": 10000000
        }
        with mock.patch('backend.src.controllers.users.controllers.reset_password'):
            with mock.patch('backend.src.controllers.users.controllers.delete_reset'):
                res = self.test_client.post(
                    "/api/v1/users/reset",
                    json=test_req_data,
                    follow_redirects=True
                )
        self.assertEqual(200, res.status_code)
        expected_body = {'message': 'Password reset.'}
        self.assertEqual(expected_body, json.loads(res.data))

    def test_password_reset_fail_missing_email(self):
        """
        Ensure password resets fail if an email is not sent.
        """
        test_req_data = {
            "password": "1234",
            "code": 10000000
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "email": "",
            "password": "1234",
            "code": 10000000
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_password_reset_fail_missing_password(self):
        """
        Ensure password resets fail if a password is not sent.
        """
        test_req_data = {
            "email": "username@fakemail.noshow",
            "code": 10000000
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "email": "username@fakemail.noshow",
            "password": "",
            "code": 10000000
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_password_reset_fail_missing_code(self):
        """
        Ensure password resets fail if a code is not sent.
        """
        test_req_data = {
            "email": "username@fakemail.noshow",
            "password": "1234",
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "email": "username@fakemail.noshow",
            "password": "1234",
            "code": None
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_password_reset_fail_missing_email_and_password(self):
        """
        Ensure password resets fail if an eamil & password are not sent.
        """
        test_req_data = {
            "code": 10000000
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "email": "",
            "password": "",
            "code": 10000000
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_password_reset_fail_missing_email_and_code(self):
        """
        Ensure password resets fail if an eamil & code are not sent.
        """
        test_req_data = {
            "password": "1234"
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "email": "",
            "password": "1234",
            "code": None
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_password_reset_fail_missing_password_and_code(self):
        """
        Ensure password resets fail if an password & code are not sent.
        """
        test_req_data = {
            "email": "username@fakemail.noshow"
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)
        test_req_data = {
            "email": "username@fakemail.noshow",
            "password": "",
            "code": None
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    def test_password_reset_fail_failed_password_hashing(self):
        """
        Ensure password rest fails if the password hashing fails.
        """
        test_req_data = {
            "email": "username@fakemail.noshow",
            "password": "1234",
            "code": 10000000
        }
        with mock.patch('backend.src.controllers.users.controllers.PasswordHasher.hash') as file:
            file.side_effect = Exception()
            res = self.test_client.post(
                "/api/v1/users/reset",
                json=test_req_data,
                follow_redirects=True
            )
        self.assertEqual(500, res.status_code)

    def test_password_reset_fail_invalid_email(self):
        """
        Ensure password reset fails if the email str provided is invalid.
        """
        test_req_data = {
            "email": "username",
            "password": "1234",
            "code": 10000000
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_email')
    def test_password_reset_fail_bad_username(self, mocked_user):
        """
        Ensure password reset fails if the user provided a bad email address.
        """
        mocked_user.side_effect = NoResults
        test_req_data = {
            "email": "username@deffoNotAnEmail.fake",
            "password": "1234",
            "code": 10000000
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_reset_request')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_email')
    def test_password_reset_fail_bad_reset_call(self, mocked_user, mocked_reset):
        """
        Ensure password reset fails if the user never made a password reset request.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_reset.side_effect = NoResults
        test_req_data = {
            "email": "username@deffoNotAnEmail.fake",
            "password": "1234",
            "code": 10000000
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_reset_request')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_email')
    def test_password_reset_fail_expired_code(self, mocked_user, mocked_reset):
        """
        Ensure password reset fails if the user sends an expired reset code.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_reset.return_value = [["-1", 10000000, datetime.datetime(1970, 1, 1, 1, 1, 1)]]
        test_req_data = {
            "email": "username@deffoNotAnEmail.fake",
            "password": "1234",
            "code": 10000000
        }
        res = self.test_client.post(
            "/api/v1/users/reset",
            json=test_req_data,
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_post_success(self):
        """
        Ensure posting is successful.
        """
        test_req_data = {
            "message": "A message",
        }
        with mock.patch('backend.src.controllers.users.controllers.make_post'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.post(
                    "/api/v1/users/post",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Message posted.'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_post_fail_missing_access_token(self):
        """
        Ensure post fails if no access_token is sent.
        """
        res = self.test_client.post(
            "/api/v1/users/post",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_post_fail_access_token_expired(self):
        """
        Ensure posting fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.post(
                "/api/v1/users/post",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_post_fail_bad_access_token_signature(self):
        """
        Ensure posting fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.post(
                "/api/v1/users/post",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_post_fail_unknown_access_token_issue(self):
        """
        Ensure posting fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.post(
                "/api/v1/users/post",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_posts')
    @mock.patch('backend.src.controllers.users.controllers.get_number_of_posts')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_posts_success_no_scroll_token(self, mocked_user, mocked_num_posts, mocked_posts):
        """
        Ensure getting posts is successful without scroll tokens.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_num_posts.return_value = 2
        mocked_posts.return_value = [
            ["test_message1", "Fri, 01 Nov 2019 19:12:27 GMT"]
        ]
        test_req_data = {
            "username": "username",
            "posts_per_page": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/posts",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI6MiwicG9zdHNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0.rOexY_eF1nUjFJvpDbbbTTgpoVjxIh9ZbVs0Q6ggRuQ',
                'posts': [['test_message1', 'Fri, 01 Nov 2019 19:12:27 GMT']],
                'posts_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.users.controllers.get_posts')
    def test_get_posts_success_next_scroll_token(self, mocked_posts):
        """
        Ensure getting posts is successful with a next page scroll token.
        """
        mocked_posts.return_value = [
            ["test_message2", "Fri, 01 Nov 2019 19:12:28 GMT"]
        ]
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b"
                "3RhbF9wYWdlcyI6MiwicG9zdHNfcGVyX3BhZ2UiOjEsImN1cnJlbnR"
                "fcGFnZSI6Mn0.rOexY_eF1nUjFJvpDbbbTTgpoVjxIh9ZbVs0Q6ggR"
                "uQ"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/posts",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI6MiwicG9zdHNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.pkQCRbBgvwuozzSG6LK-kFGuxT8YYsYN3m9g-AzquyM',
                'current_page': 2,
                'next_page': None,
                'posts': [['test_message2', 'Fri, 01 Nov 2019 19:12:28 GMT']],
                'posts_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.users.controllers.get_posts')
    def test_get_posts_success_back_scroll_token(self, mocked_posts):
        """
        Ensure getting posts is successful with a back page scroll token.
        """
        mocked_posts.return_value = [
            ["test_message1", "Fri, 01 Nov 2019 19:12:27 GMT"]
        ]
        test_req_data = {
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
                "/api/v1/users/posts",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI6MiwicG9zdHNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0.rOexY_eF1nUjFJvpDbbbTTgpoVjxIh9ZbVs0Q6ggRuQ',
                'posts': [['test_message1', 'Fri, 01 Nov 2019 19:12:27 GMT']],
                'posts_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_posts_fail_missing_access_token(self):
        """
        Ensure getting a user's posts fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/users/posts",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_posts_fail_access_token_expired(self):
        """
        Ensure getting a user's posts fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/users/posts",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_posts_fail_bad_access_token_signature(self):
        """
        Ensure getting a user's posts fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/users/posts",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_posts_fail_unknown_access_token_issue(self):
        """
        Ensure getting a user's posts fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/users/posts",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_posts_fail_no_scroll_token_no_username(self):
        """
        Ensure getting posts fails if no username or scroll tokens were provided.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "posts_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/users/posts",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "username": "",
                "posts_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/users/posts",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_posts_fail_no_scroll_token_bad_username(self, mocked_user):
        """
        Ensure getting posts fails if the user provided a bad username.
        """
        mocked_user.side_effect = NoResults
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "username": "username",
                "posts_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/users/posts",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_number_of_posts')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_posts_fail_no_scroll_token_exceeded_last_page(self, mocked_user, mocked_num_posts):
        """
        Ensure getting posts fails if the user tries to access a page that doesn't exist.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_num_posts.return_value = 2
        test_req_data = {
            "username": "username",
            "current_page": 12,
            "posts_per_page": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/posts",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_posts_fail_sent_both_tokens(self):
        """
        Ensure getting posts fails if the user tries to send a next_page & back_page token.
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
                "/api/v1/users/posts",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.auth.controllers.PasswordHasher.verify')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_email')
    def test_patch_user_success_email_only(self, mocked_user, mocked_verify):
        """
        Ensure editing a user's email works.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_verify.return_value = True
        test_req_data = {
            "email": "username@email.com",
            "current_password": "1234"
        }
        with mock.patch('backend.src.controllers.users.controllers.get_user_via_username'):
            with mock.patch('backend.src.controllers.users.controllers.reset_user_verification'):
                with mock.patch('backend.src.controllers.users.controllers.insert_verification'):
                    with mock.patch('backend.src.controllers.users.controllers.send_mail'):
                        with mock.patch('backend.src.controllers.users.controllers.reset_email'):
                            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                                mock_token.return_value = ALT_MOCKED_TOKEN
                                res = self.test_client.patch(
                                    "/api/v1/users",
                                    json=test_req_data,
                                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                                    follow_redirects=True
                                )
                                self.assertEqual(200, res.status_code)
                                expected_body = {'message': 'Email reset, and verification mail sent. '}
                                self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.auth.controllers.PasswordHasher.verify')
    def test_patch_user_success_password_only(self, mocked_verify):
        """
        Ensure editing a user's password works.
        """
        mocked_verify.return_value = True
        test_req_data = {
            "password": "1234",
            "current_password": "1234"
        }
        with mock.patch('backend.src.controllers.users.controllers.get_user_via_username'):
            with mock.patch('backend.src.controllers.users.controllers.reset_password'):
                with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                    mock_token.return_value = ALT_MOCKED_TOKEN
                    res = self.test_client.patch(
                        "/api/v1/users",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(200, res.status_code)
                    expected_body = {'message': 'Password reset.'}
                    self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.auth.controllers.PasswordHasher.verify')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_email')
    def test_patch_user_success_email_and_password(self, mocked_user, mocked_verify):
        """
        Ensure editing a user's email & password works.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_verify.return_value = True
        test_req_data = {
            "email": "username@email.com",
            "password": "1234",
            "current_password": "1234"
        }
        with mock.patch('backend.src.controllers.users.controllers.get_user_via_username'):
            with mock.patch('backend.src.controllers.users.controllers.reset_user_verification'):
                with mock.patch('backend.src.controllers.users.controllers.insert_verification'):
                    with mock.patch('backend.src.controllers.users.controllers.send_mail'):
                        with mock.patch('backend.src.controllers.users.controllers.reset_email'):
                            with mock.patch('backend.src.controllers.users.controllers.reset_password'):
                                with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                                    mock_token.return_value = ALT_MOCKED_TOKEN
                                    res = self.test_client.patch(
                                        "/api/v1/users",
                                        json=test_req_data,
                                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                                        follow_redirects=True
                                    )
                                    self.assertEqual(200, res.status_code)
                                    expected_body = {'message': 'Email reset, and verification mail sent. Password reset.'}
                                    self.assertEqual(expected_body, json.loads(res.data))

    def test_patch_user_fail_missing_access_token(self):
        """
        Ensure patch user fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/users",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_patch_user_fail_access_token_expired(self):
        """
        Ensure patch user fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/users",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_patch_user_fail_bad_access_token_signature(self):
        """
        Ensure patch user fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/users",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_user_fail_unknown_access_token_issue(self):
        """
        Ensure patch_user fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/users",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_user_fail_email_empty(self):
        """
        Ensure patch user fails if the email sent is empty.
        """
        test_req_data = {
            "email": "",
            "current_password": "1234"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/users",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_user_fail_password_empty(self):
        """
        Ensure patch user fails if the password sent is empty.
        """
        test_req_data = {
            "password": "",
            "current_password": "1234"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/users",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_user_fail_email_and_password_missing(self):
        """
        Ensure patch user fails if the email & password were not sent.
        """
        test_req_data = {
            "current_password": "1234"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/users",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_user_fail_current_password_missing(self):
        """
        Ensure patch user fails if the user doesn't send there current password.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "email": "username@email.com",
                "password": "1234"
            }
            res = self.test_client.patch(
                "/api/v1/users",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "email": "username@email.com",
                "password": "1234",
                "current_password": ""
            }
            res = self.test_client.patch(
                "/api/v1/users",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_user_fail_missing_all_values(self):
        """
        Ensure patch user fails if the user doesn't send any valid values.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {}
            res = self.test_client.patch(
                "/api/v1/users",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "email": "",
                "password": "",
                "current_password": ""
            }
            res = self.test_client.patch(
                "/api/v1/users",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.auth.controllers.PasswordHasher.verify')
    def test_patch_user_fail_bad_current_password(self, mocked_verify):
        """
        Ensure patch user fails if the user sends an invalid current_password.
        """
        mocked_verify.side_effect = VerifyMismatchError
        with mock.patch('backend.src.controllers.users.controllers.get_user_via_username'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = ALT_MOCKED_TOKEN
                test_req_data = {
                    "email": "username@email.com",
                    "current_password": "1234"
                }
                res = self.test_client.patch(
                    "/api/v1/users",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(403, res.status_code)

    def test_patch_user_fail_bad_email(self):
        """
        Ensure patch user fails if the email sent is not an email address.
        """
        test_req_data = {
            "email": "username",
            "current_password": "1234"
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/users",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.auth.controllers.PasswordHasher.verify')
    def test_patch_user_fail_password_hashing(self, mocked_verify):
        """
        Ensure patch user fails if the password hashing fails.
        """
        mocked_verify.return_value = True
        test_req_data = {
            "password": "1234",
            "current_password": "1234"
        }
        with mock.patch('backend.src.controllers.users.controllers.get_user_via_username'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                with mock.patch('backend.src.controllers.users.controllers.PasswordHasher.hash') as file:
                    file.side_effect = Exception()
                    mock_token.return_value = ALT_MOCKED_TOKEN
                    res = self.test_client.patch(
                        "/api/v1/users",
                        json=test_req_data,
                        headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                        follow_redirects=True
                    )
                    self.assertEqual(500, res.status_code)

    def test_patch_profiler_success(self):
        """
        Ensure editing a user's profile picture URL works.
        """
        test_req_data = {
            "url": "http://image.fake"
        }
        with mock.patch('backend.src.controllers.users.controllers.update_profiler_url'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.patch(
                    "/api/v1/users/profiler",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Profile picture URL updated.'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_patch_profiler_fail_missing_access_token(self):
        """
        Ensure patch a user's profile pic URL fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/users/profiler",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_patch_profiler_fail_access_token_expired(self):
        """
        Ensure patching user's profile pic URL fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/users/profiler",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_patch_profiler_fail_bad_access_token_signature(self):
        """
        Ensure patching user's profile pic URL fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/users/profiler",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_profiler_fail_unknown_access_token_issue(self):
        """
        Ensure patching a user's profile pic URL fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/users/profiler",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_profiler_fail_missing_url(self):
        """
        Ensure patching a user's profile pic URL fails if the user doesn't send a URL.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {}
            res = self.test_client.patch(
                "/api/v1/users/profiler",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "url": ""
            }
            res = self.test_client.patch(
                "/api/v1/users/profiler",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_profiler_fail_bad_url(self):
        """
        Ensure patching a user's profile pic URL fails if the user doesn't send a valid URL.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "url": "not a url string"
            }
            res = self.test_client.patch(
                "/api/v1/users/profiler",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_follower_names')
    @mock.patch('backend.src.controllers.users.controllers.get_follower_count')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_followers_success_no_scroll_token(self, mocked_user, mocked_num_followers, mocked_followers):
        """
        Ensure getting followers is successful without scroll tokens.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_num_followers.return_value = 2
        mocked_followers.return_value = [
            ["username1", "http://fake.com", 0]
        ]
        test_req_data = {
            "username": "username",
            "users_per_page": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/followers",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI6MiwidXNlcnNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0.v2-mDpj6xdvash_c32QCw64PhAKCBnjPjoLkBiY7yKE",
                'followers': [{"username": "username1", "profiler": "http://fake.com", "follow_back": 0}],
                'users_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.users.controllers.get_follower_names')
    def test_get_followers_success_next_scroll_token(self, mocked_followers):
        """
        Ensure getting followers is successful with a next page scroll token.
        """
        mocked_followers.return_value = [
            ["username2", "http://fake.com", 0]
        ]
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3Rhb"
                "F9wYWdlcyI6MiwidXNlcnNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI"
                "6Mn0.v2-mDpj6xdvash_c32QCw64PhAKCBnjPjoLkBiY7yKE"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/followers",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI6MiwidXNlcnNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.Nfif2O8XNKso0PwCZI3BHh0jru5EhqmfH000KybZ2ZY',
                'current_page': 2,
                'next_page': None,
                'followers': [{"username": "username2", "profiler": "http://fake.com", "follow_back": 0}],
                'users_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.users.controllers.get_follower_names')
    def test_get_followers_success_back_scroll_token(self, mocked_followers):
        """
        Ensure getting followers is successful with a back page scroll token.
        """
        mocked_followers.return_value = [
            ["username1", "http://fake.com", 0]
        ]
        test_req_data = {
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI"
                "6MiwidXNlcnNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.Nfif2O8XNKso0Pw"
                "CZI3BHh0jru5EhqmfH000KybZ2ZY"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/followers",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI6MiwidXNlcnNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0.v2-mDpj6xdvash_c32QCw64PhAKCBnjPjoLkBiY7yKE",
                'followers': [{"username": "username1", "profiler": "http://fake.com", "follow_back": 0}],
                'users_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_followers_fail_missing_access_token(self):
        """
        Ensure getting a user's followers fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/users/followers",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_followers_fail_access_token_expired(self):
        """
        Ensure getting a user's followers fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/users/posts",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_followers_fail_bad_access_token_signature(self):
        """
        Ensure getting a user's followers fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/users/posts",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_followers_fail_unknown_access_token_issue(self):
        """
        Ensure getting a user's followers fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/users/posts",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_followers_fail_no_scroll_token_no_username(self):
        """
        Ensure getting followers fails if no username or scroll tokens were provided.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "users_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/users/followers",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "username": "",
                "users_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/users/followers",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_followers_fail_no_scroll_token_bad_username(self, mocked_user):
        """
        Ensure getting followers fails if the user provided a bad username.
        """
        mocked_user.side_effect = NoResults
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "username": "username",
                "users_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/users/followers",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_follower_count')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_followers_fail_no_scroll_token_exceeded_last_page(self, mocked_user, mocked_num_followers):
        """
        Ensure getting followers fails if the user tries to access a page that doesn't exist.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_num_followers.return_value = 2
        test_req_data = {
            "username": "username",
            "current_page": 12,
            "users_per_page": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/followers",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_followers_fail_sent_both_tokens(self):
        """
        Ensure getting followers fails if the user tries to send a next_page & back_page token.
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
                "/api/v1/users/followers",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_following_names')
    @mock.patch('backend.src.controllers.users.controllers.get_following_count')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_following_success_no_scroll_token(self, mocked_user, mocked_num_followings, mocked_followings):
        """
        Ensure getting followings is successful without scroll tokens.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_num_followings.return_value = 2
        mocked_followings.return_value = [
            ["username1", "http://fake.com", 0]
        ]
        test_req_data = {
            "username": "username",
            "users_per_page": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/following",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI6MiwidXNlcnNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0.v2-mDpj6xdvash_c32QCw64PhAKCBnjPjoLkBiY7yKE",
                'following': [{"username": "username1", "profiler": "http://fake.com", "follow_back": 0}],
                'users_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.users.controllers.get_following_names')
    def test_get_following_success_next_scroll_token(self, mocked_followings):
        """
        Ensure getting followings is successful with a next page scroll token.
        """
        mocked_followings.return_value = [
            ["username2", "http://fake.com", 0]
        ]
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3Rhb"
                "F9wYWdlcyI6MiwidXNlcnNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI"
                "6Mn0.v2-mDpj6xdvash_c32QCw64PhAKCBnjPjoLkBiY7yKE"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/following",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI6MiwidXNlcnNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.Nfif2O8XNKso0PwCZI3BHh0jru5EhqmfH000KybZ2ZY',
                'current_page': 2,
                'next_page': None,
                'following': [{"username": "username2", "profiler": "http://fake.com", "follow_back": 0}],
                'users_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.users.controllers.get_following_names')
    def test_get_following_success_back_scroll_token(self, mocked_followings):
        """
        Ensure getting followings is successful with a back page scroll token.
        """
        mocked_followings.return_value = [
            ["username1", "http://fake.com", 0]
        ]
        test_req_data = {
            "back_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI"
                "6MiwidXNlcnNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.Nfif2O8XNKso0Pw"
                "CZI3BHh0jru5EhqmfH000KybZ2ZY"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/following",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xLCJ0b3RhbF9wYWdlcyI6MiwidXNlcnNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0.v2-mDpj6xdvash_c32QCw64PhAKCBnjPjoLkBiY7yKE",
                'following': [{"username": "username1", "profiler": "http://fake.com", "follow_back": 0}],
                'users_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_following_fail_missing_access_token(self):
        """
        Ensure getting a user's followers fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/users/following",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_following_fail_access_token_expired(self):
        """
        Ensure getting a user's followings fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/users/following",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_following_fail_bad_access_token_signature(self):
        """
        Ensure getting a user's followings fails if the access_token signature does not match
        the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/users/following",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_following_fail_unknown_access_token_issue(self):
        """
        Ensure getting a user's followings fails if some unknown error relating to the access_token
        occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/users/following",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_following_fail_no_scroll_token_no_username(self):
        """
        Ensure getting followings fails if no username or scroll tokens were provided.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "users_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/users/following",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "username": "",
                "users_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/users/following",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_following_fail_no_scroll_token_bad_username(self, mocked_user):
        """
        Ensure getting followings fails if the user provided a bad username.
        """
        mocked_user.side_effect = NoResults
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {
                "username": "username",
                "users_per_page": 1
            }
            res = self.test_client.get(
                "/api/v1/users/following",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_following_count')
    @mock.patch('backend.src.controllers.users.controllers.get_user_via_username')
    def test_get_following_fail_no_scroll_token_exceeded_last_page(self, mocked_user, mocked_num_followings):
        """
        Ensure getting followings fails if the user tries to access a page that doesn't exist.
        """
        mocked_user.return_value = [[-1, "username@fakemail.noshow", "username", "apassword", 0, "http://image.fake", 0, 0, 0, 0]]
        mocked_num_followings.return_value = 2
        test_req_data = {
            "username": "username",
            "current_page": 12,
            "users_per_page": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/following",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_following_fail_sent_both_tokens(self):
        """
        Ensure getting followings fails if the user tries to send a next_page & back_page token.
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
                "/api/v1/users/following",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_timeline')
    @mock.patch('backend.src.controllers.users.controllers.get_timeline_length')
    def test_get_timeline_success_no_scroll_token(self, mocked_num_items, mocked_items):
        """
        Ensure getting timelines is successful without scroll tokens.
        """
        mocked_num_items.return_value = 2
        mocked_items.return_value = [
            [
                1,
                "username",
                "a song",
                155000,
                "1986-08-09 11:22:40",
                1,
                "2019-12-01 15:38:12",
                "http://fake.com",
                "http://cover.com",
                None,
                8,
                "http://profiler.fake",
                0,
                "song"
            ],
            [
                None,
                "username",
                None,
                None,
                None,
                None,
                "2019-12-01 15:36:48",
                None,
                None,
                "a message",
                None,
                "http://profiler.fake",
                None,
                "post"
            ]
        ]
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/timeline",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': None,
                'timeline': [
                    {
                        'cover': 'http://cover.com',
                        'created': '1986-08-09 11:22:40',
                        'duration': 155000,
                        'likes': 8,
                        'profiler': "http://profiler.fake",
                        'public': 1,
                        'sid': 1,
                        'title': 'a song',
                        'type': 'song',
                        'url': 'http://fake.com',
                        'username': 'username',
                        'like_status': 0
                    },
                    {
                        "created": "2019-12-01 15:36:48",
                        "message": "a message",
                        "type": "post",
                        "username": "username",
                        'profiler': "http://profiler.fake"
                    }
                ],
                'items_per_page': 50,
                'total_pages': 1
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.users.controllers.get_timeline')
    def test_get_timeline_success_next_scroll_token(self, mocked_items):
        """
        Ensure getting timelines is successful with a next page scroll token.
        """
        mocked_items.return_value = [
            [
                None,
                "username",
                None,
                None,
                None,
                None,
                "2019-12-01 15:36:48",
                None,
                None,
                "a message",
                None,
                "http://profiler.fake",
                None,
                "post"
            ]
        ]
        test_req_data = {
            "next_page": (
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlcyI6Miwi"
                "aXRlbXNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0.KzmYqNxQ3f01w"
                "sTxVFIexfuUghov2mmvarVW8p17wEE"
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/timeline",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzb25nc19vbmx5IjpudWxsLCJwb3N0c19vbmx5IjpudWxsLCJ0b3RhbF9wYWdlcyI6MiwiaXRlbXNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.7CrnzsMiSzCA9IYbSg_qCXnmzmUxmM4YOSnaav2QqUA',
                'current_page': 2,
                'next_page': None,
                'timeline': [
                    {
                        "created": "2019-12-01 15:36:48",
                        "message": "a message",
                        "type": "post",
                        "username": "username",
                        "profiler": "http://profiler.fake"
                    }
                ],
                'items_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    @mock.patch('backend.src.controllers.users.controllers.get_timeline')
    def test_get_timeline_success_back_scroll_token(self, mocked_followers):
        """
        Ensure getting timelines is successful with a back page scroll token.
        """
        mocked_followers.return_value = [
            [
                1,
                "username",
                "a song",
                155000,
                "1986-08-09 11:22:40",
                1,
                "2019-12-01 15:38:12",
                "http://fake.com",
                "http://cover.com",
                None,
                8,
                "http://profiler.fake",
                0,
                "song"
            ]
        ]
        test_req_data = {
            "back_page": (
                'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b3RhbF9wYWdlcyI6Miwi'
                'aXRlbXNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6MX0.eptlXF2rXVtYO'
                'OcHZ5lmSV9K_EkF75L68diSw5rcZSk'
            )
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/timeline",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(200, res.status_code)
            expected_body = {
                'back_page': None,
                'current_page': 1,
                'next_page': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzb25nc19vbmx5IjpudWxsLCJwb3N0c19vbmx5IjpudWxsLCJ0b3RhbF9wYWdlcyI6MiwiaXRlbXNfcGVyX3BhZ2UiOjEsImN1cnJlbnRfcGFnZSI6Mn0.w2RCi7sKxkE0IubkvV-rxwMMSUMLJ3Q4izIOVnEJ0RM",
                'timeline': [
                    {
                        'cover': 'http://cover.com',
                        'created': '1986-08-09 11:22:40',
                        'duration': 155000,
                        'likes': 8,
                        'public': 1,
                        'sid': 1,
                        'title': 'a song',
                        'type': 'song',
                        'url': 'http://fake.com',
                        'username': 'username',
                        "profiler": "http://profiler.fake",
                        "like_status": 0
                    }
                ],
                'items_per_page': 1,
                'total_pages': 2
            }
            self.assertEqual(expected_body, json.loads(res.data))

    def test_get_timeline_fail_missing_access_token(self):
        """
        Ensure getting a user's timeline fails if no access_token is sent.
        """
        res = self.test_client.get(
            "/api/v1/users/timeline",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_get_timeline_fail_access_token_expired(self):
        """
        Ensure getting a user's timeline fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.get(
                "/api/v1/users/timeline",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_get_timeline_fail_bad_access_token_signature(self):
        """
        Ensure getting a user's timeline fails if the access_token signature
        does not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.get(
                "/api/v1/users/timeline",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_get_timeline_fail_unknown_access_token_issue(self):
        """
        Ensure getting a user's timeline fails if some unknown error relating
        to the access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.get(
                "/api/v1/users/timeline",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    @mock.patch('backend.src.controllers.users.controllers.get_timeline_length')
    def test_get_timeline_fail_no_scroll_token_exceeded_last_page(self, mocked_num_items):
        """
        Ensure getting timelines fails if the user tries to access a page that
        doesn't exist.
        """
        mocked_num_items.return_value = 2
        test_req_data = {
            "current_page": 12,
            "items_per_page": 1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.get(
                "/api/v1/users/timeline",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_get_timeline_fail_sent_both_tokens(self):
        """
        Ensure getting timelines fails if the user tries to send a next_page &
        back_page token.
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
                "/api/v1/users/timeline",
                query_string=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_notification_status_success(self):
        """
        Ensure editing a user's notification preferences works.
        """
        test_req_data = {
            "status": 0
        }
        with mock.patch('backend.src.controllers.users.controllers.update_silence_all_notificaitons'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.patch(
                    "/api/v1/users/notifications",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'All notifications unmuted'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_patch_notification_status_fail_missing_access_token(self):
        """
        Ensure patch notifications fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/users/notifications",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_patch_notification_status_fail_access_token_expired(self):
        """
        Ensure patch notifications fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/users/notifications",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_patch_notification_status_fail_bad_access_token_signature(self):
        """
        Ensure patch notifications fails if the access_token signature does not
        match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/users/notifications",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_notification_status_fail_unknown_access_token_issue(self):
        """
        Ensure patch notifications fails if some unknown error relating to the
        access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/users/notifications",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_notification_status_fail_missing_status(self):
        """
        Ensure patch notifications fails if the user doesn't send a status
        value.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {}
            res = self.test_client.patch(
                "/api/v1/users/notifications",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "status": None
            }
            res = self.test_client.patch(
                "/api/v1/users/notifications",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_notification_status_fail_bad_status(self):
        """
        Ensure patch notifications fails if the status sent is not a valid
        value.
        """
        test_req_data = {
            "status": -1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/users/notifications",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_follow_notification_status_success(self):
        """
        Ensure editing a user's follow notification preferences works.
        """
        test_req_data = {
            "status": 0
        }
        with mock.patch('backend.src.controllers.users.controllers.update_silence_follow_notificaitons'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.patch(
                    "/api/v1/users/notifications/follows",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Follow notifications unmuted'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_patch_follow_notification_status_fail_missing_access_token(self):
        """
        Ensure patch follow notifications fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/users/notifications/follows",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_patch_follow_notification_status_fail_access_token_expired(self):
        """
        Ensure patch follow notifications fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/users/notifications/follows",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_patch_follow_notification_status_fail_bad_access_token_signature(self):
        """
        Ensure patch follow notifications fails if the access_token signature
        does not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/users/notifications/follows",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_follow_notification_status_fail_unknown_access_token_issue(self):
        """
        Ensure patch follow notifications fails if some unknown error relating
        to the access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/users/notifications/follows",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_follow_notification_status_fail_missing_status(self):
        """
        Ensure patch follow notifications fails if the user doesn't send a
        status value.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {}
            res = self.test_client.patch(
                "/api/v1/users/notifications/follows",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "status": None
            }
            res = self.test_client.patch(
                "/api/v1/users/notifications/follows",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_follow_notification_status_fail_bad_status(self):
        """
        Ensure patch follow notifications fails if the status sent is not a
        valid value.
        """
        test_req_data = {
            "status": -1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/users/notifications/follows",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_post_notification_status_success(self):
        """
        Ensure editing a user's post notification preferences works.
        """
        test_req_data = {
            "status": 0
        }
        with mock.patch('backend.src.controllers.users.controllers.update_silence_follow_notificaitons'):
            with mock.patch(
                    'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.patch(
                    "/api/v1/users/notifications/posts",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Post notifications unmuted'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_patch_post_notification_status_fail_missing_access_token(self):
        """
        Ensure patch post notifications fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/users/notifications/posts",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_patch_post_notification_status_fail_access_token_expired(self):
        """
        Ensure patch post notifications fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/users/notifications/posts",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_patch_post_notification_status_fail_bad_access_token_signature(self):
        """
        Ensure patch post notifications fails if the access_token signature
        does not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/users/notifications/posts",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_post_notification_status_fail_unknown_access_token_issue(self):
        """
        Ensure patch post notifications fails if some unknown error relating
        to the access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/users/notifications/posts",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_post_notification_status_fail_missing_status(self):
        """
        Ensure patch post notifications fails if the user doesn't send a
        status value.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {}
            res = self.test_client.patch(
                "/api/v1/users/notifications/posts",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "status": None
            }
            res = self.test_client.patch(
                "/api/v1/users/notifications/posts",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_post_notification_status_fail_bad_status(self):
        """
        Ensure patch post notifications fails if the status sent is not a
        valid value.
        """
        test_req_data = {
            "status": -1
        }
        with mock.patch(
                'backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/users/notifications/posts",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_like_notification_status_success(self):
        """
        Ensure editing a user's like notification preferences works.
        """
        test_req_data = {
            "status": 0
        }
        with mock.patch('backend.src.controllers.users.controllers.update_silence_follow_notificaitons'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.patch(
                    "/api/v1/users/notifications/likes",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Like notifications unmuted'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_patch_like_notification_status_fail_missing_access_token(self):
        """
        Ensure patch like notifications fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/users/notifications/likes",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_patch_like_notification_status_fail_access_token_expired(self):
        """
        Ensure patch like notifications fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/users/notifications/likes",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_patch_like_notification_status_fail_bad_access_token_signature(self):
        """
        Ensure patch like notifications fails if the access_token signature
        does not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/users/notifications/likes",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_like_notification_status_fail_unknown_access_token_issue(self):
        """
        Ensure patch like notifications fails if some unknown error relating
        to the access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/users/notifications/likes",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_like_notification_status_fail_missing_status(self):
        """
        Ensure patch like notifications fails if the user doesn't send a
        status value.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {}
            res = self.test_client.patch(
                "/api/v1/users/notifications/likes",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "status": None
            }
            res = self.test_client.patch(
                "/api/v1/users/notifications/likes",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_like_notification_status_fail_bad_status(self):
        """
        Ensure patch like notifications fails if the status sent is not a
        valid value.
        """
        test_req_data = {
            "status": -1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/users/notifications/likes",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_song_notification_status_success(self):
        """
        Ensure editing a user's song notification preferences works.
        """
        test_req_data = {
            "status": 0
        }
        with mock.patch('backend.src.controllers.users.controllers.update_silence_follow_notificaitons'):
            with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
                mock_token.return_value = ALT_MOCKED_TOKEN
                res = self.test_client.patch(
                    "/api/v1/users/notifications/songs",
                    json=test_req_data,
                    headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                    follow_redirects=True
                )
                self.assertEqual(200, res.status_code)
                expected_body = {'message': 'Song notifications unmuted'}
                self.assertEqual(expected_body, json.loads(res.data))

    def test_patch_song_notification_status_fail_missing_access_token(self):
        """
        Ensure patch song notifications fails if no access_token is sent.
        """
        res = self.test_client.patch(
            "/api/v1/users/notifications/songs",
            follow_redirects=True
        )
        self.assertEqual(401, res.status_code)

    def test_patch_song_notification_status_fail_access_token_expired(self):
        """
        Ensure patch song notifications fails if the access_token is expired.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = ValueError
            res = self.test_client.patch(
                "/api/v1/users/notifications/songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(401, res.status_code)

    def test_patch_song_notification_status_fail_bad_access_token_signature(self):
        """
        Ensure patch song notifications fails if the access_token signature
        does not match the one configured on the server.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = InvalidSignatureError
            res = self.test_client.patch(
                "/api/v1/users/notifications/songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_song_notification_status_fail_unknown_access_token_issue(self):
        """
        Ensure patch song notifications fails if some unknown error relating
        to the access_token occurs.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.side_effect = Exception
            res = self.test_client.patch(
                "/api/v1/users/notifications/songs",
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(500, res.status_code)

    def test_patch_song_notification_status_fail_missing_status(self):
        """
        Ensure patch song notifications fails if the user doesn't send a
        status value.
        """
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            test_req_data = {}
            res = self.test_client.patch(
                "/api/v1/users/notifications/songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
            test_req_data = {
                "status": None
            }
            res = self.test_client.patch(
                "/api/v1/users/notifications/songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)

    def test_patch_song_notification_status_fail_bad_status(self):
        """
        Ensure patch song notifications fails if the status sent is not a
        valid value.
        """
        test_req_data = {
            "status": -1
        }
        with mock.patch('backend.src.middleware.auth_required.verify_and_refresh') as mock_token:
            mock_token.return_value = ALT_MOCKED_TOKEN
            res = self.test_client.patch(
                "/api/v1/users/notifications/songs",
                json=test_req_data,
                headers={'Authorization': 'Bearer ' + TEST_TOKEN},
                follow_redirects=True
            )
            self.assertEqual(422, res.status_code)
