import random
import datetime

from argon2 import PasswordHasher

from backend.src.models.users import insert_full_user_data, make_post, post_follow
from backend.src.models.audio import insert_full_song, post_like, insert_editor
from backend.src.utils import random_string


HASHER = PasswordHasher()


def populate_users(number_of_users=1000, offset=0):
    """
    Populates the user's table with randomly generated user's
    """
    insertion_count = 1
    email_extensions = [
        "@gmail.com", "@hotmail.com", "@yahoo.com", "@outlook.com", "@gmail.co.uk", "@hotmail.co.uk",
        "@yahoo.co.uk", "@outlook.ie"
    ]
    with open("names.txt") as f:
        names = f.readlines()
        names = [name.strip() for name in names]
    while insertion_count < number_of_users:
        try:
            username = random.choice(names)
            insert_full_user_data(
                insertion_count + offset,
                username + random.choice(email_extensions),
                username,
                HASHER.hash("1234"),
                1,
                "https://dcumusicloudbucket.s3-eu-west-1.amazonaws.com/profilers/1.jpeg"
            )
            insertion_count += 1
            print(str(insertion_count) + " out of " + str(number_of_users) + " users added.")
        except:
            continue


def populate_posts(start_uid, end_uid, number_of_posts=10000):
    """
    Populate Posts table with random posts from random user's at random times.
    """
    total = number_of_posts
    while number_of_posts:
        try:
            uid = random.randrange(start_uid, end_uid)
            message = random_string(32)
            time_of_post = datetime.datetime(
                random.randrange(1970, 2020),
                random.randrange(1, 13),
                random.randrange(1, 29),
                random.randrange(0, 24),
                random.randrange(0, 60),
                random.randrange(0, 60)
            )
            make_post(uid, message, time_of_post)
            number_of_posts -= 1
            print(str(total - number_of_posts) + " out of " + str(total) + " posts added.")
        except:
            continue


def populate_followers(start_uid, end_uid, number_of_followers=10000):
    """
    Adds random follower pairings to the DB
    """
    total = number_of_followers
    follow_pairs = []
    while number_of_followers:
        uid_follower = random.randrange(start_uid, end_uid)
        uid_following = random.randrange(start_uid, end_uid)
        if (uid_follower, uid_following) in follow_pairs:
            continue
        try:
            post_follow(uid_follower, uid_following)
            number_of_followers -= 1
            follow_pairs.append((uid_follower, uid_following))
            print(str(total - number_of_followers) + " out of " + str(total) + " followers added.")
        except:
            continue


def populate_songs(start_uid, end_uid, number_of_songs=1000, offset=0):
    """
    Creates random song entries in the DB
    """
    insertion_count = 1
    genres = ["rock", "pop", "blues", "jazz", "techno", "classical", "grime", "rap", "r&b", "funky", "disco"]
    while insertion_count < number_of_songs:
        try:
            time_created = datetime.datetime(
                random.randrange(1970, 2020),
                random.randrange(1, 13),
                random.randrange(1, 29),
                random.randrange(0, 24),
                random.randrange(0, 60),
                random.randrange(0, 60)
            )
            url = "https://dcumusicloudbucket.s3-eu-west-1.amazonaws.com/compiled_audio/-1.mp3"
            cover = "https://ak1.ostkcdn.com//images/products/is/images/direct/7b6c3256bfe728cf81c9be8ec0d56b62da59571e/Title-Unavailable.jpg"
            insert_full_song(
                insertion_count + offset,
                random.randrange(start_uid, end_uid),
                "Test Song " + str(insertion_count),
                155000,
                time_created,
                1,
                url,
                cover,
                random.choice(genres)
            )
            insertion_count += 1
            print(str(insertion_count) + " out of " + str(number_of_songs) + " songs added.")
        except:
            continue


def populate_song_likes(start_uid, end_uid, start_sid, end_sid, number_of_song_likes=10000):
    """
    Adds random Song Like pairings to the DB
    """
    total = number_of_song_likes
    like_pairs = []
    while number_of_song_likes:
        uid_liker = random.randrange(start_uid, end_uid)
        sid_liked = random.randrange(start_sid, end_sid)
        if (uid_liker, sid_liked) in like_pairs:
            continue
        try:
            post_like(uid_liker, sid_liked)
            number_of_song_likes -= 1
            like_pairs.append((uid_liker, sid_liked))
            print(str(total - number_of_song_likes) + " out of " + str(total) + " song likes added.")
        except:
            continue


def populate_song_editors(start_uid, end_uid, start_sid, end_sid, number_of_song_editors=10000):
    """
    Adds random Song Editor pairings to the DB
    """
    total = number_of_song_editors
    editor_pairs = []
    while number_of_song_editors:
        uid = random.randrange(start_uid, end_uid)
        sid = random.randrange(start_sid, end_sid)
        if (sid, uid) in editor_pairs:
            continue
        try:
            insert_editor(sid, uid)
            number_of_song_editors -= 1
            editor_pairs.append((sid, uid))
            print(str(total - number_of_song_editors) + " out of " + str(total) + " song editors added.")
        except:
            continue


def populate_db():
    """
    A simple utility function to populate the DB with a diverse range of
    test data for development purposes. It is prudent to reset the DB prior
    to running this script
    """
    number_of_users = 1000
    user_offset = 0
    number_of_songs = 1000
    song_offset = 0
    populate_users(number_of_users, user_offset)
    populate_posts(user_offset, user_offset + number_of_users)
    populate_followers(user_offset, user_offset + number_of_users)
    populate_songs(user_offset, user_offset + number_of_users, number_of_songs, song_offset)
    populate_song_likes(user_offset, user_offset + number_of_users, song_offset, song_offset + number_of_songs)
    populate_song_editors(user_offset, user_offset + number_of_users, song_offset, song_offset + number_of_songs)


if __name__ == "__main__":
    populate_db()
