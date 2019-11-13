# All info required for configuration here, is available in the Password.kdbx file.
# Please set the environment vars below prior to running the system.
import os


# user & password field should be populated with the
# username & password for MySQL located in the Password.kdbx file.
MYSQL_CONFIG = {
    'user': os.environ['MUSICLOUD_DB_USER'],
    'password': os.environ['MUSICLOUD_DB_PASSWORD'],
    'host': 'musicloud.c3aguwab64mp.eu-west-1.rds.amazonaws.com',
    'database': 'musicloud_db',
    'raise_on_warnings': True
}

# user & password field should be populated with the
# username & password for Gmail located in the Password.kdbx file.
SMTP_CONFIG = {
    'user': os.environ['MUSICLOUD_SMTP_USER'],
    'password': os.environ['MUSICLOUD_SMTP_PASSWORD'],
    'server': os.environ['MUSICLOUD_SMTP_SERVER']
}

HOST = "dcumusicloud.com:5000"

# This should be set to the 'JWT_SECRET' value available in the Password.kdbx file.
JWT_SECRET = os.environ['MUSICLOUD_JWT_SECRET']

AWS_CREDS = {
   'AWSAccessKeyId': os.environ['MUSICLOUD_AWS_ACCESS_KEY_ID'],
   'AWSSecretKey': os.environ['MUSICLOUD_AWS_ACCESS_KEY'],
   'Bucket': os.environ['MUSICLOUD_AWS_BUCKET']
}

# This option controls how long users have to enter a password reset code before it is deemed expired.
# The unit of time is minutes
RESET_TIMEOUT = 30

BUCKET_URL = "https://dcumusicloudbucket.s3-eu-west-1.amazonaws.com/"
