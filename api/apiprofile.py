"""TODO"""
import sqlite3 as sql
from bcrypt import hashpw, gensalt

class AddedUserError(Exception):
    """Happened if two users have the same username

    Args:
        Exception: is literally the exception
    """
    def __init__(self, message):
        super().__init__(message)

class VirtualProfile:
    """Is meta profile (changes to this profile will not update in the db)"""
    id : int
    username : str
    password : bytes
    email : str
    salt : bytes

    def does_password_match(self, input_password : str) -> bool:
        """Returns true if the input_password matches the stored password 

        Args:
            input_password (str): The inputed password

        Returns:
            bool: Does the password match?
        """
        encoded_pass : bytes = input_password.encode('utf-8')
        hashed_input : bytes = hashpw(encoded_pass, self.salt)
        return hashed_input == self.password

    def generate_login_key(self) -> str:
        """Is a class copy of generate auth token

        Returns:
            str: Auth code
        """
        return generate_login_cookie(self.username, self.password, self.email, self.salt)

    def __init__(self, identifier : int, cursor : sql.Cursor) -> None:
        cmd : str = "SELECT USERNAME, EMAIL, PASSWORD, SALT FROM users WHERE ID = ?"
        fetched = cursor.execute(cmd, (identifier,)).fetchone()
        password : str = fetched["PASSWORD"]
        self.id = identifier
        self.username = fetched["USERNAME"]
        self.password = hashpw(password.encode("utf-8"), fetched["SALT"])
        self.email = fetched["EMAIL"]
        self.salt = fetched["SALT"]

def generate_login_cookie(username : str, password : bytes, email : str, salt : bytes):
    """Generation an authenation string based on:
    - username
    - password
    - email

    Args:
        username (str): The name of the user
        password (str): The password of the user
        email (str): The email of the user
        salt (bytes): Used to generate the auth token

    Returns:
        str: Auth code
    """
    combined : str = username + hex(int.from_bytes(password)) + email
    key = hashpw(combined.encode(), salt)
    hexed : str = hex(int.from_bytes(key, byteorder='little'))
    return hexed

def add_user(username : str, password : str, email : str, cursor : sql.Cursor) -> VirtualProfile:
    """Adds a user to the database

    Args:
        username (str): The username
        password (str): The unhashed password
        email (str): The email of the user
        cursor (sql.Cursor): The db's cursor

    Raises:
        AddedUserError: Happens if two username are the same

    Returns:
        FullProfile: The profile
    """
    salt : bytes = gensalt()
    hashed_pass : bytes = hashpw(password.encode('utf-8'), salt)
    auth_key = generate_login_cookie(username, hashed_pass, email, salt)
    pre_exists = cursor.execute("SELECT ID FROM users WHERE USERNAME = ?", (username,)).fetchone()
    print(pre_exists)
    if pre_exists is not None:
        raise AddedUserError(f"Error adding user: {username}")
    cmd = "INSERT INTO users (USERNAME, EMAIL, PASSWORD, SALT, AUTH) VALUES (?, ?, ?, ?, ?)"
    cursor.execute(cmd, (username, email, password, salt, auth_key))
    identifier = cursor.execute("SELECT ID FROM users WHERE USERNAME = ?", (username,)).fetchone()
    cursor.connection.commit()
    return VirtualProfile(identifier["ID"], cursor)

def auth_to_userid(cursor: sql.Cursor, auth: str):
    """Converts the login (auth) cookie to the user's id

    Args:
        cursor (sql.Cursor): Database's cursor
        auth (str): The login cookie

    Returns:
        int: the id
    """
    user_json = cursor.execute("SELECT ID FROM users WHERE AUTH = ?", (auth,)).fetchone()
    return user_json['ID']
