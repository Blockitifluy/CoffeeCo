"""Server Image tests"""
import requests

UPLOAD_URL = "http://localhost:8000/api/images/upload?name=brian2"
DOWNLOAD_URL = "http://localhost:8000/api/images/download"

def upload_post() -> str:
    """Uploads the image

    Returns:
        str: file name
    """
    with open("meta/tests/testimage.jpeg", "rb") as f:
        content = f.read()

    count_content = len(content)
    header = {
        "Content-Type": "image/jpeg",
        "Content-Length": str(count_content),
        "Accept": "application/json"
    }

    upload_req = requests.post(UPLOAD_URL, data=content, headers=header, timeout=10)
    upload_req.raise_for_status()

    file_name = upload_req.json()["fileName"]
    print("Success\n")
    return file_name

def download_file(file_name: str):
    """Downloads and writes a jpeg

    Args:
        file_name (str): the file name being uploaded
    """
    download_params = [("url", file_name)]
    try:
        download_req = requests.get(DOWNLOAD_URL, timeout=10, params=download_params)
        download_req.raise_for_status()
    except requests.HTTPError as e:
        print(e)
        return

    content = download_req.content

    with open("meta/tests/imagereturn.jpeg", "bw") as f:
        f.write(content)
        print("Success!\n")

if __name__ == "__main__":
    file_url: str | None = None
    try:
        print("Uploadng...")
        file_url = upload_post()
    except requests.HTTPError as err:
        print(err)

    if file_url is not None:
        print("Download...")
        download_file(file_url)
