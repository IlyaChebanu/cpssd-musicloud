from ..models.audio import is_editor


def permitted_to_edit(sid, uid):
    return bool(is_editor(sid, uid))
