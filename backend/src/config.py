# All info required for configuration here, is available in the Password.kdbx file.

# user & password field should be populated with the
# username & password for MySQL located in the Password.kdbx file.
MYSQL_CONFIG = {
    'user': '',
    'password': '',
    'host': 'musicloud.c3aguwab64mp.eu-west-1.rds.amazonaws.com',
    'database': 'musicloud_db',
    'raise_on_warnings': True
}

# user & password field should be populated with the
# username & password for Gmail located in the Password.kdbx file.
SMTP_CONFIG = {
    'user': '',
    'password': '',
    'server': 'email-smtp.eu-west-1.amazonaws.com'
}

HOST = "dcumusicloud.com:5000"

# This should be set to the 'JWT_SECRET' value available in the Password.kdbx file.
JWT_SECRET = (
    ""
)

AWS_CREDS = {
   'AWSAccessKeyId': '',
   'AWSSecretKey': '',
   'Bucket': ''
}

# This option controls how long users have to enter a password reset code before it is deemed expired.
# The unit of time is minutes
RESET_TIMEOUT = 30
