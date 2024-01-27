from flask import Flask, Response, jsonify, request
import gzip
import json 
from typing import Literal
import sqlite3 as sql
import pathlib
import mimetypes
import os

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
    EMAIL TEXT
  )""")

def OpenFile(dir : str) -> tuple[bytes, int]:
  content : bytes = bytes()
  code : int = 404
  
  with open(os.path.abspath(dir), 'rb') as f:
    content = gzip.compress(f.read())
    code = 200

  if code == 404:
    print(f"Couldn't read the file '{dir}'")

  return (content, code)
    
@app.route('/about', methods=['GET'])
@app.route('/users/<int:id>', methods=['GET'])
@app.route('/', methods=['GET'])
def base():
  read, code = OpenFile('dist\index.html')

  return Response(status=code, response=read, headers=[("Content-Encoding", "gzip"), ("Content-Type", "text/html")])

def get_mime(path : str) -> str:
  parsed = pathlib.Path(path)

  for ext, mime in assets_mimes.items():
    if parsed.suffix == ext:
      return mime
  
  return mimetypes.guess_extension(path)

@app.route('/assets/<path:dir>', methods=['GET'])
def assets(dir : str):
  read, code = OpenFile(f'dist/assets/{dir}')
  mime : str = get_mime(dir)

  return Response(response=read, status=code, content_type=mime, headers=[("Content-Encoding", "gzip"), ("Content-Type", mime)])

@app.route("/api/user/add", methods=["POST"])
def add_user():
  data = json.loads(request.data.decode("utf-8"))
  print(data)

  if len(request.data) == 0:
    return Response(status=400, response="Bad Request: No body") #Bad Request: No body
  
  username : str = data["username"]
  email : str | Literal["NULL"] = xstr(data["email"])
  
  try:
    cursor.execute(f"INSERT INTO users (USERNAME, EMAIL) VALUES ('{username}', '{email}')")
  except sql.IntegrityError as e:
    return Response(status=401, response="User already exists", mimetype="text/plain")

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

db_connection.commit()
db_connection.close()