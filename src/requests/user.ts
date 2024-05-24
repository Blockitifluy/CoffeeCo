import Cookies from "js-cookie";
import { FetchError } from "../common";

/**
 * Properties of a User:
 * - username,
 * - handle,
 * - bio,
 * - Banner,
 * - Profile,
 * - FollowersCount
 * @todo Add Followers
 */
export interface User {
	/**
	 * A non-unique username
	 */
	username: string;
	/**
	 * An unqiue username
	 */
	handle: string;
	/**
	 * The biography of a User
	 */
	bio: string;
	/**
	 * An image link to the User's Banner
	 */
	Banner: string;
	/**
	 * A image link to the User's Profile
	 */
	Profile: string;

	/**
	 * The followers count
	 * @todo Add Followers
	 */
	FollowersCount: number;
}

/**
 * A Placeholder Default User
 */
export const DefaultUser: User = {
	username: "default",
	handle: "default",
	bio: "Lorem Ipsum",
	Banner: "https://placehold.co/1080x256",
	Profile: "https://placehold.co/64",
	FollowersCount: 0
};

/**
 * Get the Auth Token cookie
 * @returns The auth token (could be undefined)
 */
export function GetAuthToken(): string | undefined {
	return Cookies.get("AuthToken");
}

/**
 * Checks if the user is logged in using the {@link GetAuthToken} method
 * @returns Is logged in
 */
export function IsLoggedIn(): boolean {
	return GetAuthToken() !== undefined;
}

/**
 *
 * @param handle The user's handle
 * @param password The user's password (unhashed)
 * @returns Login Response
 */
export async function UserLogin(
	handle: string,
	password: string
): Promise<Response> {
	const LoginBody = {
		handle: handle,
		password: password
	};

	const Res = await fetch("/api/user/log-in", {
		method: "POST",
		body: JSON.stringify(LoginBody),
		mode: "no-cors",
		cache: "no-cache",
		headers: {
			"Content-Type": "application/json"
		}
	});

	if (!Res.ok) {
		const ResError: FetchError = await Res.json();

		console.error(ResError);

		throw new Error(ResError.public);
	}

	return Res;
}

/**
 * Adds a new user to the database
 * @param handle The user's handle
 * @param password The user's password (unhashed)
 * @param email The user's email
 * @returns New User Response
 */
export async function NewUser(handle: string, password: string, email: string) {
	const ResBody = {
		username: handle,
		handle: handle,
		bio: "Hello there, I am new to CoffeeCo",

		Banner: "",
		Profile: "",

		password: password,
		email: email
	};

	const Res: Response = await fetch("/api/user/add", {
		method: "POST",
		body: JSON.stringify(ResBody),
		mode: "no-cors",
		cache: "no-store"
	});

	if (!Res.ok) {
		const ResError: FetchError = await Res.json();

		console.error(ResError);

		throw new Error(ResError.public);
	}

	return Res;
}

/**
 * AuthToID goes through the database for a user with the same auth (as provided) and returns the id
 * @param auth (Optional) The `AuthToken` cookie
 * @returns User's ID (-1 then there was an error)
 */
export async function AuthToID(auth?: string): Promise<number> {
	const authToken = auth ?? Cookies.get("AuthToken");

	if (!authToken) throw new Error("AuthToken is undefined");

	const Res = await fetch(
		`http://localhost:8000/api/user/auth-to-id/${authToken}`,
		{
			method: "GET",
			mode: "no-cors"
		}
	);

	if (!Res.ok) {
		return -1;
	}

	return parseInt(await Res.text());
}

/**
 * GetUserFromID gets a User from ID provided
 * @param ID The user's ID
 * @returns An User Object
 */
export async function GetUserFromID(ID: number): Promise<User> {
	const Res = await fetch(
		`http://localhost:8000/api/user/get-user-from-id/${ID}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		}
	);

	const json = await Res.json();

	if (!Res.ok) {
		console.error(json);

		throw new Error(json.public);
	}

	return json;
}

/**
 * GetUserFromAuth get the user from the `AuthToken` cookie
 * @param auth (Optional) The `AuthToken` cookie
 * @returns An User Object
 */
export async function GetUserFromAuth(
	auth?: string
): Promise<User | undefined> {
	const ID = await AuthToID(auth);

	if (ID === -1) return undefined;

	return GetUserFromID(ID);
}
