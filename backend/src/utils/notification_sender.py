"""
This code was adapted from the the code found here:
https://pushy.me/docs/resources/python-backend-sample
"""
import requests

from backend.src.config import PUSHY_KEY


def notification_sender(message, dids):
    """
    Generic function to send push notifications with the Pushy API.
    """
    data = {'message': message}

    # Optional push notification options (such as iOS notification fields)
    options = {
        'notification': {
            'badge': 1,
            'sound': 'ping.aiff',
            'body': message
        }
    }

    # Default post data to provided options or empty object
    payload = options or {}

    # Set notification payload and recipients
    payload['to'] = dids
    payload['data'] = data

    url = 'https://api.pushy.me/push?api_key=' + PUSHY_KEY
    headers = {'Content-Type': 'application/json'}

    requests.post(url, headers=headers, data=payload)


if __name__ == "__main__":
    notification_sender("Kamil, tell me if you get this!", ["3615e9fa78663a20a62007"])
