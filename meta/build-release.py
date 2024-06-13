"""Automaticly creates a release file"""
import subprocess
import shutil
import os
from pathlib import Path
from dotenv import load_dotenv

DB_PATH = "temp/api/database/db.sql"
TABLE_INIT_PATH = "temp/api/database/db-init"

def clear_folder(folder: str):
    """Clears the contents of a folder

    Args:
        folder (str): Folder Path
    """
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except shutil.Error as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

def does_file_exists(path: str) -> bool:
    """Checks if a file exists

    Args:
        name (str): the name file's path

    Returns:
        bool: does it exist
    """
    return os.path.isfile(path)

def build_with_vite() -> bool:
    """Build a website using Vite

    Returns:
        bool: successful
    """
    vite_path = os.getenv("PATH_TO_VITE")
    if vite_path is None:
        return False
    command = f"{vite_path} build --outDir temp/dist --manifest files.json"
    code = subprocess.call(command.split(" "), shell=True)
    return code == 0

def create_exe() -> bool:
    """Build the server exe using Go

    Returns:
        bool: successful
    """
    code = subprocess.call(["go", "build", "-o", "temp/server.exe"], shell=True)
    return code == 0

def create_database():
    """Creates the database directory"""
    os.mkdir("temp/api")
    os.mkdir("temp/api/database")

    Path(DB_PATH).touch()
    Path(TABLE_INIT_PATH).touch()

    shutil.copyfile("api/database/db-init", TABLE_INIT_PATH)

def copy_from(src: str, dst: str):
    """Copies a file

    Args:
        src (str): Copies from
        dst (str): Pastes to
    """
    Path(dst).touch()
    shutil.copyfile(src, dst)

def start(name: str) -> tuple[bool, str]:
    """Starts the build process

    Args:
        name (str): name of the release

    Returns:
        tuple[bool, str]: successful and result
    """
    if does_file_exists(f"release/{name}.zip"):
        return False, f"File {name} already exists"

    try:
        os.mkdir("temp")
    except FileExistsError:
        clear_folder("temp")
        print("Temp file already exists")

    vite_success = build_with_vite()
    if not vite_success: # Building wasn't successful
        return False, "Error with Vite"

    print("Building server")
    exe_success = create_exe()
    if exe_success == 0:
        return False, "Empty exe"

    create_database()
    copy_from(".env", "temp/.env")
    copy_from("manifest.json", "temp/manifest.json")

    return True, "Success"

if __name__ == "__main__":
    load_dotenv()
    release_name = input("Release Name: ")

    success, result = start(release_name)
    if success:
        print("Build was successful")
        shutil.make_archive(f"release/{release_name}", "zip", "temp")
    else:
        print(result)
