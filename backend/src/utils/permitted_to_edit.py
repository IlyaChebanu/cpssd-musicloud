from ..models.audio import editable


def permitted_to_edit(sid, uid):
    return bool(editable(sid, uid))
