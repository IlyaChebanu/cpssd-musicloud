import smtplib

from ..config import SMTP_CONFIG


def send_mail(to, subject, body):
    """Sends an email to the provided address"""
    # Connect to SMTP server.
    sent_from = "dcumusicloud@gmail.com"
    email_text = """From: %s\nTo: %s\nSubject: %s\n\n%s
        """ % (sent_from, to, subject, body)
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
