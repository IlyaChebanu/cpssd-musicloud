"""
Utility function to create a post dictionary.
"""


def gen_timeline_post_object(post_list):
    """
    Takes in a post timeline row from from the DB and creates a post dict.
    :param post_list:
    List - Raw timeline post result returned from DB.
    :return:
    Dict - The input data structured in a standard dict.
    """
    print(post_list)
    return {
        "username": post_list[1],
        "created": post_list[6],
        "message": post_list[9],
        "profiler": post_list[11],
        "type": post_list[12]
    }
