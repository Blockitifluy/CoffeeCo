"""Shouldn't be used as a module"""
import datetime
from json import loads, dumps
from typing import Any
import sqlite3 as sql
from flask import Flask, Response, jsonify, request
import apiprofile
import serverutility

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

@app.route('/login', methods=['GET'])
@app.route('/signup', methods=['GET'])
@app.route('/about', methods=['GET'])
@app.route('/', methods=['GET'])
def base_page() -> Response:
    """Returns the base page

    Returns:
        Response: The index.html
    """
    read, code = serverutility.open_file('dist/index.html')

    return Response(status=code, response=read, headers=BASE_HEADERS)


## API

@app.route('/api/user/authtoid', methods=['GET'])
def auth_to_id() -> Response:
    """Turns the auth (from the cookies) to an id

    Returns:
        Response: Can have an status of 401 or 200
    """
    auth = request.cookies.get(key='login', default=None, type=str)

    if auth is None:
        return Response(response="{\"error\":\"No auth\"}", status=401)

    user_json = cursor.execute("SELECT ID FROM users WHERE AUTH = ?", (auth,)).fetchone()

    return Response(response=dumps(user_json), status=200, content_type='application/json')

@app.route('/manifest.json', methods=['GET'])
def manifest() -> Response:
    """Returns the manifest.json

    Returns:
        Response: The manifest.json
    """

    read, code = serverutility.open_file('dist/manifest.json')

    mime = "application/json"

    return Response(response=read, status=code, content_type=mime, headers=BASE_HEADERS)


@app.route('/assets/<path:file_directory>', methods=['GET'])
def assets(file_directory : str) -> Response:
    """The assets folder

    Args:
        file_directory (str): The file directory

    Returns:
        Response: response to the file
    """
    read, code = serverutility.open_file(f'dist/assets/{file_directory}')
    mime : str = serverutility.get_mime(file_directory)

    return Response(response=read, status=code, content_type=mime, headers=BASE_HEADERS)



@app.route("/api/user/add", methods=["POST"])
def add_user() -> Response:
    """Adds a user

    Returns:
        Response: Added response
    """
    data = loads(request.data.decode("utf-8"))

    if len(request.data) == 0:
        dump = dumps({"error":'no body'})

        return Response(status=400, response=dump, mimetype="application/json")

    password : str = data["password"]
    username : str = data["username"]
    email : str = data["email"]

    profile : apiprofile.FullProfile | None = None

    try:
        profile = apiprofile.new_user(username, password, email, cursor)
    except apiprofile.AddedUserError as e:
        print(e)

        dump = dumps({"error":'Error adding user'})

        return Response(status=401, response=dump, mimetype="application/json")

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

    profile = apiprofile.FullProfile(data['id'], cursor)
    does_match : bool = profile.can_authorise_user(password)

    print(profile.password, password, does_match)

    if not does_match:
        return Response(None, status=400)

    expire_date = datetime.datetime.now() + datetime.timedelta(days=365)

    auth_key = profile.generate_auth_key()
    resp : Response = Response(status=200)
    resp.set_cookie(key="LOGIN", value=auth_key, expires=expire_date, path="/")

    return resp



@app.route('/api/user/getfromusername/<username>', methods=['GET'])
def get_user_by_name(username : str):
    """Gets a user by the id

    Args:
        username (string): The username

    Returns:
        Response: returns the {'ID' and 'USERNAME'} returned json
    """

    print(username)

    cmd = "SELECT ID, USERNAME FROM users WHERE USERNAME = ?"

    row = cursor.execute(cmd, (username,)).fetchone()

    return jsonify(row)

@app.route('/api/user/getfromid/<int:userid>', methods=['GET'])
def get_user_by_id(userid : int):
    """Gets a user by the id

    Args:
        identifition (int): The userid

    Returns:
        Response: returns the {'ID' and 'USERNAME'} returned json
    """

    print(userid)

    cmd = "SELECT ID, USERNAME FROM users WHERE ID = ?"

    row = cursor.execute(cmd, (userid,)).fetchone()

    return jsonify(row)

if __name__ == '__main__':
    #Check if connection is running
    print(db_connection.total_changes)

    #serverutility.init_db(cursor)

    app.run(host="localhost", port=8000)

cursor.close()
db_connection.close()
