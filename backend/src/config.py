"""
All info required for configuration here, is available in the Password.kdbx
file. Please set the environment vars below prior to running the system.
"""
import os

# MySQL credentials for our RDS instance.
MYSQL_CONFIG = {
    'user': os.environ['MUSICLOUD_DB_USER'],
    'password': os.environ['MUSICLOUD_DB_PASSWORD'],
    'host': os.environ['MUSICLOUD_DB_HOST'],
    'database': 'musicloud_db',
    'raise_on_warnings': True
}

# SMTP setup for sending email.
SMTP_CONFIG = {
    'user': os.environ['MUSICLOUD_SMTP_USER'],
    'password': os.environ['MUSICLOUD_SMTP_PASSWORD'],
    'server': os.environ['MUSICLOUD_SMTP_SERVER'],
    'sender': os.environ['MUSICLOUD_SMTP_SENDER']
}

# Host domain for our service.
HOST = os.environ['MUSICLOUD_DOMAIN']

# Protocol for out service.
PROTOCOL = os.environ['MUSICLOUD_PROTOCOL']

# JWT signing key.
JWT_SECRET = os.environ['MUSICLOUD_JWT_SECRET']

# AWS S3 bucket credentials.
AWS_CREDS = {
    'AWSAccessKeyId': os.environ['MUSICLOUD_AWS_ACCESS_KEY_ID'],
    'AWSSecretAccessKey': os.environ['MUSICLOUD_AWS_ACCESS_KEY'],
    'Bucket': os.environ['MUSICLOUD_AWS_BUCKET'],
}

# This option controls how long users have to enter a password reset code
# before it is deemed expired. The unit of time is minutes.
RESET_TIMEOUT = 30

# AWS S3 bucket URL.
BUCKET_URL = os.environ['MUSICLOUD_AWS_BUCKET_URL']

# Toggle Logging
LOGGING = True

# Pushy API key
PUSHY_KEY = os.environ['MUSICLOUD_PUSHY_KEY']
