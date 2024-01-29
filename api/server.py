from flask import Flask, Response, jsonify, request
import os 
from bcrypt import gensalt, hashpw
from gzip import compress
from json import loads 
from typing import Literal
import sqlite3 as sql
from pathlib import Path 
from mimetypes import guess_type as mime_type

assets_mimes : dict[str, str] = {
  ".ico": "image/vnd.microsoft.icon",
  ".svg": "image/svg+xml",
  ".js": "text/javascript",
  ".css": "text/css"
}

sql.threadsafety = 2

def xstr(s : str | None) -> str:
  if s is None:
    return 'NONE'
  return s

def dict_factory(cursor, row):
  d = {}
  for idx, col in enumerate(cursor.description):
    d[col[0]] = row[idx]
  return d

app = Flask(__name__)
db_connection = sql.connect("api/api.sql", check_same_thread=False)
db_connection.row_factory = dict_factory

cursor = db_connection.cursor()

def init_db():
  cursor.execute("""CREATE TABLE users (
    ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    USERNAME TEXT UNIQUE NOT NULL,
    EMAIL TEXT,
    PASSWORD BLOB,
    SALT BLOB
  )""")

def OpenFile(dir : str) -> tuple[bytes, int]:
  content : bytes = bytes()
  code : int = 404
  
  with open(os.path.abspath(dir), 'rb') as f:
    content = compress(f.read())
    code = 200

  if code == 404:
    print(f"Couldn't read the file '{dir}'")

  return (content, code)

@app.route('/users/<id>', methods=['GET'])
def user(id : str):
  return base()

@app.route('/signin', methods=['GET'])
@app.route('/about', methods=['GET'])
@app.route('/', methods=['GET'])
def base():
  read, code = OpenFile('dist\index.html')

  return Response(status=code, response=read, headers=[("Content-Encoding", "gzip"), ("Content-Type", "text/html")])

def get_mime(path : str) -> str:
  parsed = Path(path)

  for ext, mime in assets_mimes.items():
    if parsed.suffix == ext:
      return mime
  
  return mime_type(path)

@app.route('/assets/<path:dir>', methods=['GET'])
def assets(dir : str):
  read, code = OpenFile(f'dist/assets/{dir}')
  mime : str = get_mime(dir)

  return Response(response=read, status=code, content_type=mime, headers=[("Content-Encoding", "gzip"), ("Content-Type", mime)])

@app.route("/api/user/add", methods=["POST"])
def add_user():
  data = loads(request.data.decode("utf-8"))
  print(data)

  if len(request.data) == 0:
    return Response(status=400, response="Bad Request: No body") #Bad Request: No body
  
  unhashed_password : str = data["password"]
  salt : bytes = gensalt()
  
  username : str = data["username"]
  email : str | Literal["NULL"] = xstr(data["email"])
  password : bytes = hashpw(unhashed_password.encode(), salt)
  
  try:
    salt_hex = hex(int.from_bytes(salt, byteorder='little'))
    pass_hex = hex(int.from_bytes(password, byteorder='little'))
    # salt_hex = binascii.hexlify(salt).decode('utf-8')
    # pass_hex = binascii.hexlify(password).decode('utf-8')

    cmd = "INSERT INTO users (USERNAME, EMAIL, PASSWORD, SALT) VALUES (?, ?, ?, ?)"

    print(cmd)

    cursor.execute(cmd, (username, email, password, salt))
    db_connection.commit()
  except sql.Error as e:
    print(f"Error adding user: {e}")

    return Response(status=401, response=f"Error adding user: {e}", mimetype="text/plain")


  return Response(status=201, response="Added user: success", mimetype="text/plain")

@app.route('/api/user/getfromid/<int:id>', methods=['GET'])
def get_user_by_id(id : int):
  row = cursor.execute(f"SELECT ID, USERNAME FROM users WHERE ID = {id}").fetchone()
  
  return jsonify(row)

if __name__ == '__main__':
  #Check if connection is running
  print(db_connection.total_changes)

  #init_db()

  rows = cursor.execute(
    "SELECT ID, USERNAME, EMAIL FROM users"
  ).fetchall()
  print(rows)

  app.run(host="localhost", port=8000)

cursor.close()
db_connection.close()