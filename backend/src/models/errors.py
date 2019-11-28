"""
Error classes that can be raised during model transactions.
"""


class NoResults(Exception):
    """
    Exception for SELECT queries that are expected
    to return a result
    """
