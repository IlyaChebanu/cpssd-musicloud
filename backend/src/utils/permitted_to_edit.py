from ..models.audio import is_editor, is_public


def permitted_to_edit(sid, uid):
    return bool(is_editor(sid, uid)) and not bool(is_public(sid))
