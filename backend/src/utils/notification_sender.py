"""
This code was adapted from the the code found here:
https://pushy.me/docs/resources/python-backend-sample
"""
import requests
import json

from backend.src.config import PUSHY_KEY


def notification_sender(message, dids):
    """
    Generic function to send push notifications with the Pushy API.
    """
    payload = json.dumps({
        'notification': {
            'badge': 1,
            'sound': 'ping.aiff',
            'body': message
        },
        'to': dids,
        'data': {
            'message': message
        }
    })

    # Set notification payload and recipients

    url = 'https://api.pushy.me/push?api_key=' + PUSHY_KEY
    headers = {'Content-Type': 'application/json'}

    requests.post(url, headers=headers, data=payload)
