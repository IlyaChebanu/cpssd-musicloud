import smtplib

from ..config import SMTP_CONFIG


def send_mail(sent_from, to, email_text):
    """Sends an email to the provided address"""
    # Connect to SMTP server.
    smtp = smtplib.SMTP()
    server = SMTP_CONFIG.get("server")
    port = 587
    smtp.connect(server, port)
    smtp.ehlo()
    smtp.starttls()
    smtp.login(SMTP_CONFIG.get("user"), SMTP_CONFIG.get("password"))

    # Send email & close connection.
    smtp.sendmail(sent_from, to, email_text)
    smtp.close()
