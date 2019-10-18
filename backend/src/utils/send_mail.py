import smtplib

from ..config import GMAIL_CONFIG


def send_mail(sent_from, to, email_text):
    """Sends an email to the provided address"""
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
