# Server Methods

Go to:

1. [User](#user)
2. [Post](#post)
3. [Images](#images)

# User

## /api/user/get-user-from-id/{id}

`GET` Method

Gets an User based on it's `ID`.

Returns `application/json`.

`/api/user/get-user-from-id/1`

```json
{
	"username": "foobar", // The user's non-unique of the user
	"handle": "foobar", // The user's unique of the user
	"Banner": "https://placehold.co/1080x512", // The url of the user's Banner
	"Profile": "https://placehold.co/64", // The url of the user's Profile
	"bio": "Lorem Ipsum" // The biography of the user
}
```

## /api/user/auth-to-id/{auth}

`GET` Method

Gets an User's `id` based on it's `AuthToken`.

`/api/user/auth-to-id/42069`

```js
8721;
```

## /api/user/log-in

`POST` Method

Has a request body `application/json`:

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

```json
{
	"Public": "Incorrect Password",
	"Message": "password wrong"
}
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
	"ID": 1,
	"username": "a",
	"handle": "a",
	"bio": "Lorem Ipsum",
	"Banner": "https://placehold.co/1080x512",
	"Profile": "https://placehold.co/64",
	"email": "a@mail.com",
	"password": "helloworld"
}
```

Adds a new user

## /api/user/search

`GET` Method

Has three URL queries:

- `name` string,
- `from` integer,
- `range` integer

Has a request body `application/json`:

`/api/user/search?name=foobar&from=0&range=2`

```json
[
	{
		"ID": 1,
		"username": "foobar",
		"handle": "foobar",
		"bio": "Lorem Ipsum",
		"Banner": "https://placehold.co/1080x512",
		"Profile": "https://placehold.co/64",
		"email": "a@mail.com",
		"password": "helloworld"
	},

	{
		"ID": 2,
		"username": "foobar2",
		"handle": "foobar2",
		"bio": "Lorem Ipsum",
		"Banner": "https://placehold.co/1080x512",
		"Profile": "https://placehold.co/64",
		"email": "a@mail.com",
		"password": "helloworld"
	}
]
```

Searchs for a user based on name (similar to [`api/post/search`](#apipostsearch)).

# Post

## /api/post/get-comments-from-post

`GET` Method

Gets a requested amount of comments from a post

Query Params:

- ID (_number_): The ID of the given user,
- amount (_number_): The amount of wanted posts

Returns `application/json`.

`/api/user/get-comments-from-post?ID=3&amount=2`

```json
// Notice how the parentID is the same
[
	{
		"ID": 4,
		"postedBy": 2,
		"content": "Chocolate Bar",
		"parentID": 3,
		"images": ""
	},
	{
		"ID": 3,
		"postedBy": 1,
		"content": "Ice Cream",
		"parentID": 3,
		"images": "image-url-here (image-alt-text-here)"
	}
]
```

## /api/post/get-post-from-id/{ID}

`GET` Method

Gets a post from it's `ID`.

Returns `application/json`.

`/api/post/get-post-from-id/1`

```JSON
{
  "ID": 1234, // ID of the post
  "postedBy": 12, // The ID of the person who posted the post
  "content": "Hello World", // The text content of the post
  "parentID": -1, // If the parentID is -1 it's a sole post, else it parentID is the parent ID's post
  "images": "image-url-here (alternate text), a (b)" // A string verison of a list
}
```

## /api/post/feedlist/amount

`GET` Method

Gets x amount of posts

Returns `application/json`.

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

Returns `application/json`.

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

Has a request body `application/json`.

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

**THIS IS DEPRECATED, DO NOT USE!**

`GET` Method

Gets a requested amount of posts from a user (similar to `/api/post/feedlist)

Query Params:

- ID (_number_): The ID of the given user,
- amount (_number_): The amount of wanted posts

Returns `application/json`.

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

## /api/post/get-user-post-history

`GET` Method

Gets posts, exluding comments, from user sorted by recent (Unlike [get-post-from-user](#apipostget-posts-from-user) which is random).

Query Params:

- `ID` int - ID of user
- `from` int - starting from
- `range` int - the amount wanted

Returns `application/json`.

`/api/post/get-user-post-history?ID=1&from=0&range=3`

```json
[
	{
		"ID": 1,
		"postedBy": 1,
		"content": "Foo Bar",
		"parentID": -1,
		"images": ""
	},
	{
		"ID": 2,
		"postedBy": 1,
		"content": "Foo Bar #1",
		"parentID": -1,
		"images": "image-url-here (alternate text), a (b)"
	},
	{
		"ID": 10,
		"postedBy": 1,
		"content": "Hello World",
		"parentID": -1,
		"images": "image-url-here (alternate text), a (b)"
	}
]
```

## /api/post/search

`GET` Method

Search posts, exluding comments, based on it content and sorted by recent (similar to [/api/user/search](#apiusersearch)).

Query Params:

- `content` string - the search query
- `from` int - starting from
- `range` int - the amount wanted

Returns `application/json`.

`/api/post/search?content=hello%20world&from=0&range=2`

```json
[
	{
		"ID": 1,
		"postedBy": 1,
		"content": "Hello World",
		"parentID": -1,
		"images": ""
	},
	{
		"ID": 3,
		"postedBy": 2,
		"content": "Hello World, Hello Great World",
		"parentID": -1,
		"images": ""
	}
]
```

# Images

## /api/images/upload

`POST` Method

Uploads an image to database

Has a request body of:

- `image/png`,
- `image/jpeg`,
- `image/gif`

Returns `application/json`:

```txt
4bdf72aa-dfe6-476d-8d34-f10b20534f24;
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
