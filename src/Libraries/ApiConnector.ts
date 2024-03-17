import Cookies from "js-cookie";

export interface PublicUser {
	id: number;
	username: string;
	handle: string;
	bio: string;
	followersCount: number;
	Banner: string;
	Profile: string;
}

export interface SigninUser {
	username: string;
	handle: string;
	password: string;
	email: string;
}

export interface PostRequest {
	text: string;
	postTime: number;
	User: PublicUser;
	ImagesUser: string[4]; // Empty url is an empty string ""

	PostOwner?: PostRequest; // Used for comments
	Comments: PostRequest[];

	// Reactions
	likes: number;
	dislikes: number;
}

export async function GetUserFromUsername(
	username: string
): Promise<PublicUser> {
	const UserFetch = await fetch(
		`http://localhost:8000/api/user/getfromusername/${username}`,
		{
			method: "GET",
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Content-type": "applicatiomn/json"
			},
			body: null,
			mode: "no-cors",
			cache: "default"
		}
	);

	if (!UserFetch.ok) {
		throw new Error(`Fetch wasn't ok: ${UserFetch.status}`);
	}

	return UserFetch.json();
}

export const DEFAULT_PUBLIC_USER = {
	id: 0,
	username: "Loading",
	bio: "Loading...",
	handle: "@loading",
	followersCount: 0,
	Banner: "",
	Profile: ""
};

export async function GetUserFromUserId(userId: number): Promise<PublicUser> {
	const UserFetch = await fetch(
		`http://localhost:8000/api/user/get-user-from-id/${userId}`
	);

	if (!UserFetch.ok) {
		throw new Error(`Fetch wasn't ok: ${UserFetch.status}`);
	}

	return UserFetch.json();
}

export async function LoginUser(
	id: number,
	password: string
): Promise<Response> {
	const LoginFetch = await fetch("http://localhost:8000/api/user/login", {
		method: "POST",
		headers: {
			"Access-Control-Allow-Origin": "http://localhost:8000"
		},
		body: JSON.stringify({ id, password }),
		mode: "no-cors",
		cache: "default"
	});

	if (!LoginFetch.ok) {
		throw new Error(`Fetch wasn't ok: ${LoginFetch.status}`);
	}

	return LoginFetch;
}

/**
 * Add a user to the database.
 * @param User Contains `password`, `username` and `email`
 * @returns An object containing:
 * - `ID`,
 * - `password`,
 * - `username`,
 * - `email`
 */
export async function AddUser(
	User: SigninUser
): Promise<{ ID: number } & SigninUser> {
	const CreateFetch = await fetch("http://localhost:8000/api/user/add", {
		method: "POST",
		headers: { Accept: "application/json" },
		body: JSON.stringify(User),
		mode: "no-cors",
		cache: "default"
	});

	if (!CreateFetch.ok) {
		throw new Error(`Fetch wasn't ok: ${CreateFetch.status}`);
	}

	const Json: { ID: number } = await CreateFetch.json();

	return { ...Json, ...User };
}

/**
 * Returns the user's id using the Login Cookie (Auth cookie)
 * @returns The id as an object
 * @example {ID: 1}
 */
export async function AuthToId(): Promise<number> {
	const Login = Cookies.get("LOGIN");

	const AuthFetch = await fetch(
		`http://localhost:8000/api/user/auth-to-id/${Login}`,
		{
			method: "GET",
			headers: { Accept: "application/json" },
			body: null,
			mode: "no-cors",
			cache: "default"
		}
	);

	if (!AuthFetch.ok) {
		throw new Error(`Fetch wasn't ok: ${AuthFetch.status}`);
	}

	return (await AuthFetch.json()).ID;
}
