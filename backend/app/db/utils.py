from bson import ObjectId
from typing import Any, Dict

def get_id_query(id_str: str) -> Dict[str, Any]:
    """
    Returns a MongoDB query for an _id that supports both string and ObjectId.
    """
    query = {"_id": id_str}
    
    # Also support ObjectId if it's a valid 24-char hex string
    if isinstance(id_str, str) and len(id_str) == 24:
        try:
            query = {"$or": [{"_id": id_str}, {"_id": ObjectId(id_str)}]}
        except Exception:
            pass
            
    return query
