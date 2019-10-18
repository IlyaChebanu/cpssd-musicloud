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
GMAIL_CONFIG = {
    'user': '',
    'password': ''
}

HOST = "localhost:5000"

# This should be set to the 'JWT_SECRET' value available in the Password.kdbx file.
JWT_SECRET = (
    ""
)
