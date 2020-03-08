from flask_script import Manager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, MigrateCommand

from src.config import MYSQL_CONFIG  # pylint:disable=E0401
from src import APP  # pylint:disable=E0401

APP.config['SQLALCHEMY_DATABASE_URI'] = (
        'mysql://' + MYSQL_CONFIG['user'] + ':' + MYSQL_CONFIG['password']
        + '@' + MYSQL_CONFIG['host'] + '/' + MYSQL_CONFIG['database']
)
APP.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(APP)
migrate = Migrate(APP, db)
manager = Manager(APP)

manager.add_command('db', MigrateCommand)


class Users(db.Model):
    __tablename__ = 'Users'

    uid = db.Column(
        db.Integer, primary_key=True, nullable=False, unique=True,
        autoincrement=True
    )
    email = db.Column(db.VARCHAR(256), nullable=False, unique=True)
    username = db.Column(db.VARCHAR(100), nullable=False, unique=True)
    password = db.Column(db.TEXT, nullable=False)
    verified = db.Column(db.BOOLEAN, default=0)
    profiler = db.Column(db.VARCHAR(255))
    silence_follow_notifcation = db.Column(db.BOOLEAN, default=0)
    silence_post_notifcation = db.Column(db.BOOLEAN, default=0)
    silence_song_notifcation = db.Column(db.BOOLEAN, default=0)
    silence_like_notifcation = db.Column(db.BOOLEAN, default=0)


class Songs(db.Model):
    __tablename__ = 'Songs'

    sid = db.Column(
        db.Integer, primary_key=True, nullable=False, unique=True,
        autoincrement=True
    )
    uid = db.Column(db.Integer, db.ForeignKey(Users.uid), nullable=False)
    title = db.Column(db.VARCHAR(255), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    created = db.Column(db.DATETIME, nullable=False)
    public = db.Column(db.BOOLEAN, nullable=False, default=0)
    published = db.Column(db.DATETIME)
    url = db.Column(db.VARCHAR(255))
    cover = db.Column(db.VARCHAR(255))
    genre = db.Column(db.VARCHAR(255))
    description = db.Column(db.VARCHAR(512))


class Verification(db.Model):
    __tablename__ = 'Verification'

    code = db.Column(
        db.VARCHAR(64), unique=True, nullable=False, primary_key=True
    )
    uid = db.Column(db.Integer, db.ForeignKey(Users.uid), nullable=False)


class Song_Likes(db.Model):
    __tablename__ = 'Song_Likes'
    __table_args__ = (
        db.PrimaryKeyConstraint('sid', 'uid'),
    )

    sid = db.Column(db.Integer, db.ForeignKey(Songs.sid), nullable=False)
    uid = db.Column(db.Integer, db.ForeignKey(Users.uid), nullable=False)


class Song_Editors(db.Model):
    __tablename__ = 'Song_Editors'
    __table_args__ = (
        db.PrimaryKeyConstraint('sid', 'uid'),
    )

    sid = db.Column(db.Integer, db.ForeignKey(Songs.sid), nullable=False)
    uid = db.Column(db.Integer, db.ForeignKey(Users.uid), nullable=False)


class Resets(db.Model):
    __tablename__ = 'Resets'

    uid = db.Column(
        db.Integer, db.ForeignKey(Users.uid), unique=True, nullable=False,
        primary_key=True
    )
    code = db.Column(db.Integer, nullable=False)
    time_issued = db.Column(db.DATETIME, nullable=False)


class Posts(db.Model):
    __tablename__ = 'Posts'
    __table_args__ = (
        db.PrimaryKeyConstraint('uid'),
    )

    uid = db.Column(db.Integer, db.ForeignKey(Users.uid), nullable=False)
    message = db.Column(db.VARCHAR(21844), nullable=False)
    time = db.Column(db.DATETIME, nullable=False)


class Logins(db.Model):
    __tablename__ = 'Logins'
    __table_args__ = (
        db.PrimaryKeyConstraint('uid'),
    )

    uid = db.Column(db.Integer, db.ForeignKey(Users.uid), nullable=False)
    access_token = db.Column(db.TEXT, nullable=False)
    time_issued = db.Column(db.DATETIME, nullable=False)


class Followers(db.Model):
    __tablename__ = 'Followers'
    __table_args__ = (
        db.PrimaryKeyConstraint('follower', 'following'),
    )

    follower = db.Column(db.Integer, db.ForeignKey(Users.uid), nullable=False)
    following = db.Column(db.Integer, db.ForeignKey(Users.uid), nullable=False)


class Song_State(db.Model):
    __tablename__ = 'Song_State'
    __table_args__ = (
        db.PrimaryKeyConstraint('sid'),
    )

    sid = db.Column(db.Integer, db.ForeignKey(Songs.sid), nullable=False)
    state = db.Column(db.JSON, nullable=False)
    time_updated = db.Column(db.DATETIME, nullable=False)


class Playlists(db.Model):
    __tablename__ = 'Playlists'
    __table_args__ = (
        db.PrimaryKeyConstraint('pid', 'uid'),
    )

    pid = db.Column(
        db.Integer, nullable=False, unique=True, autoincrement=True
    )
    uid = db.Column(db.Integer, db.ForeignKey(Users.uid), nullable=False)
    title = db.Column(db.VARCHAR(255), nullable=False)
    created = db.Column(
        db.DATETIME, nullable=False, default=db.func.current_timestamp()
    )
    updated = db.Column(
        db.DATETIME, nullable=False, default=db.func.current_timestamp()
    )


class Playlist_State(db.Model):
    __tablename__ = 'Playlist_State'
    __table_args__ = (
        db.PrimaryKeyConstraint('pid', 'sid'),
    )

    pid = db.Column(db.Integer, db.ForeignKey(Playlists.pid), nullable=False)
    sid = db.Column(db.Integer, db.ForeignKey(Songs.sid), nullable=False)


class Notifications(db.Model):
    __tablename__ = 'Notifications'

    did = db.Column(
        db.VARCHAR(255), unique=True, nullable=False, primary_key=True
    )
    uid = db.Column(db.Integer, db.ForeignKey(Users.uid), nullable=False)


if __name__ == '__main__':
    manager.run()