from typing import Any, Dict

def format_mongo_id(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Helper to convert MongoDB _id to string id
    """
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc

def clean_dict(d: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove None values from a dictionary
    """
    return {k: v for k, v in d.items() if v is not None}
