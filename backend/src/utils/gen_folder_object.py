"""
Utility function to create a folder dictionary.
"""


def gen_folder_object(folder_list):
    """
    Takes in a folder row from from the DB and creates a folder dict.
    :param folder_list:
    List - Raw folder result returned from DB.
    :return:
    Dict - The input data structured in a standard dict.
    """
    res = {
        "folder_id": folder_list[0],
        "name": folder_list[1]
    }
    return res
