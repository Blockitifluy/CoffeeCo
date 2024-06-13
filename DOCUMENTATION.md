# Documentation

This is the Documentation of CoffeeCo, this includes:

- Database Tables
- .exe Flags,
- Server throwing Errors,
- Server Methods

# Database Tables

## Images

| Field    | Type   | Used As | Description                                                     |
| -------- | ------ | ------- | --------------------------------------------------------------- |
| URL      | string | uuid    | Name of an Image (using `uuid`)                                 |
| content  | bytes  | \_      | The content of the image (Compressed and zipped using `gzip`)   |
| mimetype | string | \_      | The type of image, e.g.: `image/png`, `image/jpeg`, `image/gif` |

## Posts

| Field       | Type     | Used As                        | Description                                                                                     |
| ----------- | -------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| ID          | integer  | \_                             | The ID of the Post                                                                              |
| timeCreated | DateTime | \_                             | The Time when the post created                                                                  |
| postedBy    | integer  | Users                          | The User that posted it                                                                         |
| parentID    | integer  | \_                             | If the ParentID is not equal to -1, then the ParentID is comments Parent, else it's a sole post |
| content     | string   | \_                             | The text of the post                                                                            |
| images      | string   | img-url (alt-text),img2 (alt2) | A list of images and their alt text                                                             |

## Users

| Field       | Type     | Used As | Description                                                                    |
| ----------- | -------- | ------- | ------------------------------------------------------------------------------ |
| ID          | int      | \_      | The ID of the User in chronological order                                      |
| username    | string   | \_      | The non-unique name of the User                                                |
| password    | bytes    | \_      | The hashed password (using `hash/fnv`)                                         |
| handle      | string   | \_      | The unique handle of the User (Still use `id` because the propetry may change) |
| email       | string   | \_      | The email of User                                                              |
| auth        | string   | \_      | The Authorisation Token (TODO: The token isn't secured)                        |
| timeCreated | DateTime | \_      | The time when the User was Created to the Database                             |
| bio         | string   | \_      | The biography/description of the User                                          |
| profile     | string   | URL     | The Profile Image                                                              |
| banner      | string   | URL     | The User's banner image                                                        |

# .exe Flags

The `CoffeeCo.exe` has multiple flags such as:

- `--debug` (boolean), prints all the loaded methods
- `--port :8000` (string), the port of the `localhost`, Make sure to prepend the port with a semicolon, note: this not updated on the client

# Sending Errors

This server has a special way of sending messages, such as:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/josn

{
	"public": "message for the user",
	"message": "detailed message for the developer"
}
```

# Server Methods

For Server Methods please go [here](./SERVER_METHODS.md).
