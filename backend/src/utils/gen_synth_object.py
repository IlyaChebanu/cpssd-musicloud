"""
Utility function to create a synth dictionary.
"""
import json


def gen_synth_object(synth_list):
    """
    Takes in a file row from from the DB and creates a synth dict.
    :param synth_list:
    List - Raw synth result returned from DB.
    :return:
    Dict - The input data structured in a standard dict.
    """
    res = {
        "id": synth_list[0],
        "name": synth_list[3],
        "patch": json.loads(synth_list[2])
    }
    return res
