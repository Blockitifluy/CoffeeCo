"""Server Image tests"""
import requests

UPLOAD_URL = "http://localhost:8000/api/images/upload"
DOWNLOAD_URL = "http://localhost:8000/api/images/download/%s"

def upload_post() -> str:
    """Uploads the image

    Returns:
        str: file name
    """
    with open("meta/tests/testimage.jpeg", "rb") as f:
        content = f.read()

    header: dict[str, str] = {
        "Content-Type": "image/jpeg",
        "Content-Length": str(len(content)),
        "Accept": "application/json"
    }

    upload_req = requests.post(UPLOAD_URL, data=content, headers=header, timeout=10)
    upload_req.raise_for_status()

    return upload_req.text

def download_file(file_name: str):
    """Downloads and writes a jpeg

    Args:
        file_name (str): the file name being uploaded
    """
    download_req = requests.get(DOWNLOAD_URL % file_name, timeout=10)
    download_req.raise_for_status()

    content = download_req.content

    with open("meta/tests/imagereturn.jpeg", "bw") as f:
        f.write(content)

if __name__ == "__main__":
    file_url: str | None = None
    try:
        print("Uploadng...")
        file_url = upload_post()
        print("Success!")
    except requests.HTTPError as err:
        print(err)

    if file_url is not None:
        print("Downloading...")
        try:
            download_file(file_url)
            print("Success!")
        except requests.HTTPError as e:
            print(e)
