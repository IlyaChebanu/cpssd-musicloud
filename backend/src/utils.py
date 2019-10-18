import random
import string
import smtplib
import mysql.connector

from .config import MYSQL_CONFIG
from .config import GMAIL_CONFIG


def random_string(length):
    """Generate a random string of fixed length """
    letters = string.ascii_letters
    return ''.join(random.choice(letters) for i in range(length))


def verify_req_body(req_body, expected_values):
    if all(k in req_body for k in expected_values):
        for k in expected_values:
            if len(req_body.get(k)) == 0:
                return False
        return True
    return False


def send_mail(sent_from, to, email_text):
    # Connect to SMTP server.
    smtp = smtplib.SMTP()
    server = "smtp.gmail.com"
    port = 587
    smtp.connect(server, port)
    smtp.ehlo()
    smtp.starttls()
    smtp.login(GMAIL_CONFIG.get("user"), GMAIL_CONFIG.get("password"))

    # Send email & close connection.
    smtp.sendmail(sent_from, to, email_text)
    smtp.close()


def query(query_string, get_row=False):
    res = []
    try:
        # Open a DB connection.
        cnx = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = cnx.cursor()

        # Execute the query.
        cursor.execute(query_string)

        # Get rows if SELECT query otherwise commit changes.
        if get_row:
            res = cursor.fetchall()
        else:
            cnx.commit()

        # Close DB connection.
        cursor.close()
        cnx.close()

        # Return the result
        return res
    except mysql.connector.errors.IntegrityError:
        raise mysql.connector.errors.IntegrityError
    except Exception as e:
        print(e)
        raise Exception("MySQL unavailable.")
