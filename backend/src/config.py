# All info required for configuration here, is available in the Password.kdbx file.

# user & password field should be populated with the
# username & password for MySQL located in the Password.kdbx file.
MYSQL_CONFIG = {
    'user': 'admin',
    'password': '9xSN4xUupLNVmaY8cXmLcE2z9YBwYwnf',
    'host': 'musicloud.c3aguwab64mp.eu-west-1.rds.amazonaws.com',
    'database': 'musicloud_db',
    'raise_on_warnings': True
}

# user & password field should be populated with the
# username & password for Gmail located in the Password.kdbx file.
SMTP_CONFIG = {
    'user': 'AKIAQ6AXMYJ4ZNBXYUXU ',
    'password': 'BN4RQDDWAa8iVy267EV13lcb4IGprwtrar/Z5YIof+R1',
    'server': 'email-smtp.eu-west-1.amazonaws.com'
}

HOST = "dcumusicloud.com:5000"

# This should be set to the 'JWT_SECRET' value available in the Password.kdbx file.
JWT_SECRET = (
    "8cWFR7yAPGfGAexMYeFTsq4uvVmPfb4XY4Gp3wn3g6eBt4KTx7Z698duJy6P86XeUVHmQWdbdbAEnhj9JbiXGiUuk9hj8es7QzzQfPjM6ffVvXSxqLckA7sxfrjT2g2v6ywRisz2iynNYUbtrdrMspNMbRy3CxKF8nB3yaNr7WwQoxT7SLGE3RXmDU9LfAETjBJhRGHgaPSNvJTJhhasCEUEiijkGEv7vLrqSjxXFhqM7z5jJDXSLyu6RFuXY49S"
)

AWS_CREDS = {
   'AWSAccessKeyId': '',
   'AWSSecretKey': '',
   'Bucket': ''
}

# This option controls how long users have to enter a password reset code before it is deemed expired.
# The unit of time is minutes
RESET_TIMEOUT = 30
