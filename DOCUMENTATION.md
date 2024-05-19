# Documentation

This is the Documentation of CoffeeCo.

# Server

## /api/user/get-user-from-id/{id}

`GET` Method

Gets an User based on it's `ID`.

Returns `application/json`:

```json
{
	"username": "foobar", // The user's non-unique of the user
	"handle": "foobar", // The user's unique of the user
	"followersCount": 0, // NOT USED/DOESN'T WORK
	"Banner": "https://placehold.co/1080x512", // The url of the user's Banner
	"Profile": "https://placehold.co/64", // The url of the user's Profile
	"bio": "Lorem Ipsum" // The biography of the user
}
```

### Example

`/api/user/get-user-from-id/1`

```json
{
	"username": "a",
	"handle": "a",
	"followersCount": 0,
	"Banner": "https://placehold.co/1080x512",
	"Profile": "https://placehold.co/64",
	"bio": "Lorem Ipsum"
}
```

## /api/user/auth-to-id/{auth}

`GET` Method

Gets an User's `id` based on it's `AuthToken`.

```json
{
	"Id": 1 // The user's id
}
```

### Example

`/api/user/auth-to-id/42069`

```json
{
	"Id": 8721
}
```

## /api/user/log-in

`POST` Method

Has a request body `application/json`:

```json
{
	"handle": "a",
	"password": "helloworld"
}
```

Logins into a user, if the password is correct.

### Example

#### Incorrect Password

```json
{
	"handle": "a",
	"password": "coffeeco"
}
```

The response:

```txt
no rows found
```

#### Correct Password

```json
{
	"handle": "a",
	"password": "helloworld"
}
```

Sets the `AuthToken` as the auth, the response:

```txt
Auth Cookie added successfully
```

## /api/user/add

`POST` Method

Has a request body `application/json`:

```json
{
	"username": "a",
	"handle": "a",
	"bio": "Lorem Ipsum",
	"followersCount": 0,
	"Banner": "https://placehold.co/1080x512",
	"Profile": "https://placehold.co/64",
	"email": "a@mail.com",
	"password": "helloworld"
}
```

Adds a new user

## /api/post/get-comments-from-post

NOT IMPLEMENTED/TEST TO DO LATER!

## /api/post/get-post-from-id/{ID}

`GET` Method

Gets a post from it's `ID`.

Returns `application/json`:

```JSON
{
  "ID": 1234, // ID of the post
  "postedBy": 12, // The ID of the person who posted the post
  "content": "Hello World", // The text content of the post
  "parentID": -1, // If the parentID is -1 it's a sole post, else it parentID is the parent ID's post
  "images": "image-url-here (alternate text), a (b)" // A string verison of a list
}
```

### Example

`/api/post/get-post-from-id/1`

```JSON
{
  "ID": 1,
  "postedBy": 1,
  "content": "Foo Bar",
  "parentID": -1,
  "images": "image-url-here (alternate text), a (b)"
}
```

## /api/post/feedlist/amount

`GET` Method

Gets x amount of posts

Returns `application/json`:

```json
[
	{
		"ID": 1234, // ID of the post
		"postedBy": 12, // The ID of the person who posted the post
		"content": "Hello World", // The text content of the post
		"parentID": -1, // If the parentID is -1 it's a sole post, else it parentID is the parent ID's post
		"images": "image-url-here (alternate text), a (b)" // A string verison of a list
	}
]
```

### Example

`/api/post/feedlist/3`

```json
[
	{
		"ID": 1,
		"postedBy": 1,
		"content": "Foo Bar",
		"parentID": -1,
		"images": "image-url-here (alternate text), a (b)"
	},
	{
		"ID": 2,
		"postedBy": 2,
		"content": "Hello World",
		"parentID": -1,
		"images": "image-url-here (alternate text), a (b)"
	},
	{
		"ID": 1,
		"postedBy": 1,
		"content": "Foo Bar",
		"parentID": -1,
		"images": "image-url-here (alternate text), a (b)"
	}
]
```

## /api/post/feed

`GET` Method

Gets a random post

Returns `application/json`:

```json
{
	"ID": 1234, // ID of the post
	"postedBy": 12, // The ID of the person who posted the post
	"content": "Hello World", // The text content of the post
	"parentID": -1, // If the parentID is -1 it's a sole post, else it parentID is the parent ID's post
	"images": "image-url-here (alternate text), a (b)" // A string verison of a list
}
```

### Example

`/api/post/feed`

```json
{
	"ID": 1234, // ID of the post
	"postedBy": 12, // The ID of the person who posted the post
	"content": "Hello World", // The text content of the post
	"parentID": -1, // If the parentID is -1 it's a sole post, else it parentID is the parent ID's post
	"images": "image-url-here (alternate text), a (b)" // A string verison of a list
}
```

## /api/post/add

`POST` Method

Uploads a Post

Has a request body `application/json`:

```json
{
	"postedBy": 1,
	"content": "hello world",
	"parentID": -1,
	"images": ""
}
```

Returns:

```txt
Success
```

## /api/post/get-posts-from-user

`GET` Method

Gets a requested amount of posts from a user (similar to `/api/post/feedlist)

Query Params:

- ID (_number_): The ID of the given user,
- amount (_number_): The amount of wanted posts

Returns `application/json`:

```json
[
	{
		"ID": 1234, // ID of the post
		"postedBy": 12, // The ID of the person who posted the post
		"content": "Hello World", // The text content of the post
		"parentID": -1, // If the parentID is -1 it's a sole post, else it parentID is the parent ID's post
		"images": "image-url-here (alternate text), a (b)" // A string verison of a list
	},

	{
		"ID": 1234, // ID of the post
		"postedBy": 12, // The ID of the person who posted the post
		"content": "Hello World", // The text content of the post
		"parentID": -1, // If the parentID is -1 it's a sole post, else it parentID is the parent ID's post
		"images": "image-url-here (alternate text), a (b)" // A string verison of a list
	}
]
```

### Example

### Example

`/api/post/get-posts-from-user?amount=3&ID=1`

```json
// Notice it is all from the same user
[
	{
		"ID": 1,
		"postedBy": 1,
		"content": "Foo Bar",
		"parentID": -1,
		"images": "image-url-here (alternate text), a (b)"
	},
	{
		"ID": 3,
		"postedBy": 1,
		"content": "Foo Bar",
		"parentID": -1,
		"images": "image-url-here (alternate text), a (b)"
	},
	{
		"ID": 2,
		"postedBy": 1,
		"content": "Foo Bar",
		"parentID": -1,
		"images": "image-url-here (alternate text), a (b)"
	}
]
```

## /api/images/upload

`POST` Method

Uploads an image to database

Has a request body of:

- `image/png`,
- `image/jpeg`,
- `image/gif`

Returns `application/json`:

```json
{
	"fileName": "4bdf72aa-dfe6-476d-8d34-f10b20534f24"
}
```

## /api/images/download/{url}

`GET` Method

Gets the image by the `url`

Returns:

- `image/png`,
- `image/jpeg`,
- `image/gif`

### Example

`/api/images/download/4bdf72aa-dfe6-476d-8d34-f10b20534f24`
