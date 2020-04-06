"""
Utility function to create a file dictionary.
"""


def gen_file_object(file_list):
    """
    Takes in a file row from from the DB and creates a file dict.
    :param file_list:
    List - Raw file result returned from DB.
    :return:
    Dict - The input data structured in a standard dict.
    """
    res = {
        "file_id": file_list[0],
        "name": file_list[1],
        "url": file_list[2]
    }
    return res
