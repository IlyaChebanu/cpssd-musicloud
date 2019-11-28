"""
Generic function for generating random strings of a fixed length.
"""
import random
import string


def random_string(length):
    """
    Generate a random string of fixed length
    :param length:
    Int - Representing the length of the string.
    :return:
    Str - A random string of length(length).
    """
    letters = string.ascii_letters
    return ''.join(random.choice(letters) for i in range(length))
