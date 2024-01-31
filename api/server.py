"""Shouldn't be used as a module"""
import datetime
from json import loads, dumps
from typing import Any
from gzip import compress
import os
import sqlite3 as sql
from pathlib import Path
from mimetypes import guess_type as mime_type
from flask import Flask, Response, jsonify, request
import apiprofile

ASSETS_MIMES : dict[str, str] = {
    ".ico": "image/vnd.microsoft.icon",
    ".svg": "image/svg+xml",
    ".js": "text/javascript",
    ".css": "text/css"
}

sql.threadsafety = 2

BASE_HEADERS = [("Content-Encoding", "gzip"), ("Content-Type", "text/html")]

def dict_factory(local_cursor : sql.Cursor, row : sql.Row) -> dict[str, Any]:
    """Converts an sql array to a dictionary

    Args:
        local_cursor (sql.Cursor): The db's cursor
        row (sql.Row): a db row

    Returns:
        dict[str, Any]: Converted dictionary
    """
    d = {}
    for idx, col in enumerate(local_cursor.description):
        d[col[0]] = row[idx]
    return d

app = Flask(__name__)
db_connection = sql.connect("api/api.sql", check_same_thread=False)
db_connection.row_factory = dict_factory

cursor = db_connection.cursor()

def init_db():
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


## Pages

@app.route('/users/<_>', methods=['GET'])
def user_page(_ : str) -> Response:
    """Just for the users _ param

    Args:
        _ (str): Unused

    Returns:
        Response: a response to the index.html
    """
    return base_page()

@app.route('/signin', methods=['GET'])
@app.route('/about', methods=['GET'])
@app.route('/', methods=['GET'])
def base_page() -> Response:
    """Returns the base page

    Returns:
        Response: The index.html
    """
    read, code = open_file('dist/index.html')

    return Response(status=code, response=read, headers=BASE_HEADERS)



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



## API

@app.route('/api/user/authtoid', methods=['GET'])
def auth_to_id() -> Response:
    """Turns the auth (from the cookies) to an id

    Returns:
        Response: Can have an status of 401 or 200
    """
    auth = request.cookies.get(key='login', default=None, type=str)

    if auth is None:
        return Response(response="No auth", status=401)

    user_json = cursor.execute("SELECT ID FROM users WHERE AUTH = ?", (auth,)).fetchone()

    return Response(response=dumps(user_json), status=200, content_type='application/json')

@app.route('/manifest.json', methods=['GET'])
def manifest() -> Response:
    """Returns the manifest.json

    Returns:
        Response: The manifest.json
    """

    read, code = open_file('dist/manifest.json')

    return Response(response=read, status=code, content_type="application/json", headers=BASE_HEADERS)


@app.route('/assets/<path:file_directory>', methods=['GET'])
def assets(file_directory : str) -> Response:
    """The assets folder

    Args:
        file_directory (str): The file directory

    Returns:
        Response: response to the file
    """
    read, code = open_file(f'dist/assets/{file_directory}')
    mime : str = get_mime(file_directory)

    return Response(response=read, status=code, content_type=mime, headers=BASE_HEADERS)



@app.route("/api/user/add", methods=["POST"])
def add_user() -> Response:
    """Adds a user

    Returns:
        Response: Added response
    """
    data = loads(request.data.decode("utf-8"))

    if len(request.data) == 0:
        return Response(status=400, response="Bad Request: No body") #Bad Request: No body

    password : str = data["password"]
    username : str = data["username"]
    email : str = data["email"]

    profile : apiprofile.FullProfile | None = None

    try:
        profile = apiprofile.new_user(username, password, email, cursor)
    except apiprofile.AddedUserError as e:
        print(e)

        return Response(status=401, response="Error adding user", mimetype="text/plain")

    return Response(status=201, response=dumps({"ID": profile.id}), mimetype="application/json")



@app.route('/api/user/login', methods=["POST"])
def login():
    """Logs in user

    Returns:
        Response: Http response
    """
    data = loads(request.data.decode("utf-8"))
    print(data)
    password : str = data["password"]

    profile = apiprofile.FullProfile(data['ID'], cursor)
    does_match : bool = profile.can_authorise_user(password)

    if not does_match:
        return Response(None, status=400)

    expire_date = datetime.datetime.now() + datetime.timedelta(days=365)

    auth_key = profile.generate_auth_key()
    resp : Response = Response(status=200)
    resp.set_cookie(key="LOGIN", value=auth_key, expires=expire_date)

    return resp



@app.route('/api/user/getfromid/<int:identifition>', methods=['GET'])
def get_user_by_id(identifition : int):
    """Gets a user by the id

    Args:
        identifition (int): The userid

    Returns:
        Response: returns the {'ID' and 'USERNAME'} returned json
    """
    row = cursor.execute("SELECT ID, USERNAME FROM users WHERE ID = ?", (identifition,)).fetchone()

    return jsonify(row)


if __name__ == '__main__':
    #Check if connection is running
    print(db_connection.total_changes)

    #init_db()

    app.run(host="localhost", port=8000)

cursor.close()
db_connection.close()
