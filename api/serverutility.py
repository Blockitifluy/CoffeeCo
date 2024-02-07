"""Supplies the methods and propreties to `server.py`

Requires:
- gzip
- os
- sqlite3
- pathlib
- mimetypes

Methods and propreties
- `ASSETS_MIMES` used by get_mime,
- `get_mime` if matchs the `ASSETS_MIMES` returns the value or else uses guess_type
- `init_db` initalises tables in the database,
- `open_file` opens file as a byte file and returns the content and 200 or 404
"""
from gzip import compress
import os
import sqlite3 as sql
from pathlib import Path
from mimetypes import guess_type as mime_type

ASSETS_MIMES : dict[str, str] = {
    ".ico": "image/vnd.microsoft.icon",
    ".svg": "image/svg+xml",
    ".js": "text/javascript",
    ".png": "image/png",
    ".css": "text/css"
}

def get_mime(path : str) -> str:
    """Gets mime from ASSETS_MIMES then form mime_type

    Args:
        path (str): the file path

    Returns:
        str: mimetype
    """
    parsed = Path(path)

    for ext, mime in ASSETS_MIMES.items():
        if parsed.suffix != ext:
            continue
        return mime

    mime = mime_type(path)

    return "text/plain" if mime is not None else mime

def init_db(cursor : sql.Cursor):
    """Inits an database (may throw an error)"""
    cursor.execute("""CREATE TABLE users (
        ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        USERNAME TEXT UNIQUE NOT NULL,
        EMAIL TEXT,
        PASSWORD BLOB,
        SALT BLOB,
        AUTH TEXT
    )""")

def open_file(file_directory : str) -> tuple[bytes, int]:
    """Opens an file directory and compresses it, using zgip; returns the content and 404 or 200  

    Args:
        file_directory (str): The directory of the file

    Returns:
        tuple[bytes, int]: A tuple that contains:
        - content
        - status code: 404 not found or 200 ok 
    """
    content : bytes = bytes()
    code : int = 404

    with open(os.path.abspath(file_directory), 'rb') as f:
        content = compress(f.read())
        code = 200

    if code == 404:
        print(f"Couldn't read the file '{file_directory}'")

    return (content, code)
