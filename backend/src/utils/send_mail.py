"""
Generic function for ending emails.
"""
import smtplib

from ..config import SMTP_CONFIG


def send_mail(send_to, subject, body):
    """
    Sends an email to the provided address.
    :param send_to:
    Str - A valid email address string for the person we are sending a mail to.
    :param subject:
    Str - A subject line string.
    :param body:
    Str - The main contents of the email.
    :return:
    None - Sends the mail and returns None.
    """
    # Connect to SMTP server.
    sent_from = "dcumusicloud@gmail.com"
    email_text = """From: %s\nTo: %s\nSubject: %s\n\n%s
        """ % (sent_from, send_to, subject, body)
    smtp = smtplib.SMTP()
    server = SMTP_CONFIG.get("server")
    port = 587
    smtp.connect(server, port)
    smtp.ehlo()
    smtp.starttls()
    smtp.login(SMTP_CONFIG.get("user"), SMTP_CONFIG.get("password"))

    # Send email & close connection.
    smtp.sendmail(sent_from, send_to, email_text)
    smtp.close()
