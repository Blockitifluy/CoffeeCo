import Cookies from 'js-cookie';
import DefaultProfile from '../assets/default-profile.png';
import { FetchError } from '../common';

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
  ID: number;
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
  ID: -1,
  username: 'default',
  handle: 'default',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam velit nisl, faucibus eget ipsum non.',
  Banner: 'https://placehold.co/1080x256',
  Profile: DefaultProfile,
  FollowersCount: 0,
};

/**
 * Get the Auth Token cookie
 * @returns The auth token (could be undefined)
 */
export function getAuth(): string | undefined {
  return Cookies.get('AuthToken');
}

/**
 * Checks if the user is logged in using the {@link getAuth} method
 * @returns Is logged in
 */
export function isLoggedIn(): boolean {
  return getAuth() !== undefined;
}

/**
 *
 * @param handle The user's handle
 * @param password The user's password (unhashed)
 * @returns Login Response
 */
export async function loginUser(
  handle: string,
  password: string,
): Promise<Response> {
  const LoginBody = {
    handle: handle,
    password: password,
  };

  const Res = await fetch('/api/user/log-in', {
    method: 'POST',
    body: JSON.stringify(LoginBody),
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
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
export async function newUser(handle: string, password: string, email: string) {
  const ResBody = {
    username: handle,
    handle: handle,
    bio: 'Hello there, I am new to CoffeeCo',

    Banner: 'https://placehold.co/1080x256',
    Profile: DefaultProfile,

    password: password,
    email: email,
  };

  const Res: Response = await fetch('/api/user/add', {
    method: 'POST',
    body: JSON.stringify(ResBody),
    mode: 'no-cors',
    cache: 'no-store',
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
export async function authToID(auth?: string): Promise<number> {
  const authToken = auth ?? Cookies.get('AuthToken');

  if (!authToken) throw new Error('AuthToken is undefined');

  const Res = await fetch(
    `http://localhost:8000/api/user/auth-to-id/${authToken}`,
    {
      method: 'GET',
      mode: 'no-cors',
    },
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
export async function getUserFromID(ID: number): Promise<User> {
  const Res = await fetch(
    `http://localhost:8000/api/user/get-user-from-id/${ID}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
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
export async function getUserFromAuth(
  auth?: string,
): Promise<User | undefined> {
  const ID = await authToID(auth);

  if (ID === -1) return undefined;

  return getUserFromID(ID);
}

/**
 * Searchs for Users with same {@link User.handle handle} and {@link User.username username}.
 * @param name The search query for the user
 * @param from Start From
 * @param range The amount
 * @returns A response of the search
 */
export async function searchForUsers(
  name: string,
  from: number,
  range: number,
): Promise<Response> {
  const resURL = new URL('http://localhost:8000/api/user/search');
  resURL.searchParams.set('name', name);
  resURL.searchParams.set('from', from.toString());
  resURL.searchParams.set('range', range.toString());

  const Res = await fetch(resURL.toString(), {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-cache',
    mode: 'no-cors',
  });

  if (!Res.ok) {
    const ResError: FetchError = await Res.json();

    throw new Error(ResError.public);
  }

  return Res;
}
