"""
All info required for configuration here, is available in the Password.kdbx
file. Please set the environment vars below prior to running the system.
"""
import os

# MySQL credentials for our RDS instance.
MYSQL_CONFIG = {
    'user': os.environ['MUSICLOUD_DB_USER'],
    'password': os.environ['MUSICLOUD_DB_PASSWORD'],
    'host': 'musicloud.c3aguwab64mp.eu-west-1.rds.amazonaws.com',
    'database': 'musicloud_db',
    'raise_on_warnings': True
}

# SMTP setup for sending email.
SMTP_CONFIG = {
    'user': 'AKIAQ6AXMYJ4ZNBXYUXU',
    'password': 'BN4RQDDWAa8iVy267EV13lcb4IGprwtrar/Z5YIof+R1',
    'server': 'email-smtp.eu-west-1.amazonaws.com'
}

# Host domain for our service.
HOST = "dcumusicloud.com:5000"

# JWT signing key.
JWT_SECRET = os.environ['MUSICLOUD_JWT_SECRET']

# AWS S3 bucket credentials.
AWS_CREDS = {
    'AWSAccessKeyId': 'AKIAJQLWCAHOITMBWRJA',
    'AWSSecretAccessKey': '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',
    'Bucket': 'dcumusicloudbucket'
}

# This option controls how long users have to enter a password reset code
# before it is deemed expired. The unit of time is minutes.
RESET_TIMEOUT = 30

# AWS S3 bucket URL.
BUCKET_URL = "https://dcumusicloudbucket.s3-eu-west-1.amazonaws.com/"

# Toggle Logging
LOGGING = True
