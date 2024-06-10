import { ValidImages } from './images';
import { FetchError } from '../common';

/**
 * Database posts from The Database
 */
export interface Post {
  ID: number;
  postedBy: number;
  content: string;
  timeCreated: string;
  parentID: number;
  images: string;
}

/**
 * Contains a list of Post and ok if fetch them was successful
 */
export interface PostListReq {
  /** The posts response */
  Posts: Post[];
  /**Is request successful? */
  ok: boolean;
}

/**
 * Only used for debugging / development, do not use in production
 */
export const DefaultPost: Post = {
  ID: 0,
  postedBy: 0,
  content: 'THIS TEST CODE DO NOT USE FOR PRODUCTION',
  timeCreated: 'Invalid Date',
  parentID: -1,
  images: '',
};
/**
 * Get a post the ID
 * @param ID The identifaction of post
 */
export async function getPostFromID(ID: number): Promise<Post> {
  const Res = await fetch(`/api/post/get-post-from-id/${ID}`);

  if (!Res.ok) {
    const ResError: FetchError = await Res.json();

    console.error(ResError);

    throw new Error(ResError.public);
  }

  return Res.json();
}

/**
 * Similar to {@link PostFeed}, but with multiple posts
 * @param amount The amount of post you want to get
 * @returns Response
 */
export async function PostFeedList(amount: number): Promise<Response> {
  const Res = await fetch(`/api/post/feedlist/${amount}`, {
    cache: 'no-cache',
    mode: 'no-cors',
    method: 'GET',
  });

  if (!Res.ok) {
    const ResError: FetchError = await Res.json();

    console.error(ResError);

    throw new Error(ResError.public);
  }

  return Res;
}

/**
 * Gets a post from the database
 * @returns Response
 */
export async function PostFeed(): Promise<Response> {
  const Res = await fetch('/api/post/feed', {
    cache: 'no-cache',
    mode: 'no-cors',
    method: 'GET',
  });

  if (!Res.ok) {
    const ResError: FetchError = await Res.json();

    throw new Error(ResError.public);
  }

  return Res;
}

/**
 * Used for {@link addPost}
 * - `postedBy` - The ID of the user
 * - `parentID` - If a comment the parent ID is the post's id, if not is equal to -1
 * - `content` - The text of the post
 */
export interface AddPostRequest {
  /** The ID of the user */
  postedBy: number;
  /** If a comment the parent ID is the post's id, if not is equal to -1 */
  parentID: number;
  /** The text of the post */
  content: string;
  /** The images of the post; formed by (seperated by commas): url (alt) */
  images: string;
}

/**
 * Adds a new post to the database
 * @param Req The post data the user wants to send
 * @returns Response
 */
export async function addPost(Req: AddPostRequest): Promise<Response> {
  const imageCheck = ValidImages.test(Req.images);

  console.log(Req.images);

  if (!imageCheck && Req.images !== '') {
    throw new Error('Invalid image');
  }

  const Res = await fetch('/api/post/add', {
    cache: 'no-cache',
    mode: 'no-cors',
    method: 'POST',
    headers: {
      'Content-Type': 'appliction/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(Req),
  });

  if (!Res.ok) {
    const ResError: FetchError = await Res.json();

    console.error(ResError);

    throw new Error(ResError.public);
  }

  return Res;
}

/**
 * Get x amount of Posts from User by ID
 * @param amount The amount of Posts wanted
 * @param ID The ID of user
 * @returns The API response
 */
export async function GetPostsFromUser(
  amount: number,
  ID: number,
): Promise<Response> {
  const Res = await fetch(
    `http://localhost:8000/api/post/get-posts-from-user?amount=${amount}&ID=${ID}`,
    {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
    },
  );

  if (!Res.ok) {
    const ResError: FetchError = await Res.json();

    console.error(ResError);

    throw new Error(ResError.public);
  }

  return Res;
}

/**
 * Get comments from a post
 * @param ID The ID of post
 * @param from The bottom of search
 * @param range The amount of comments
 * @returns A promise of a list of Posts
 */
export async function getCommentsFromPost(
  ID: number,
  from: number,
  range: number,
): Promise<Response> {
  const resURL = new URL(
    'http://localhost:8000/api/post/get-comments-from-post',
  );
  resURL.searchParams.set('ID', ID.toString());
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

/**
 * Get the posts from a user, in a similar way as {@link getCommentsFromPost}.
 * @param ID The user's ID
 * @param from Start from
 * @param range The amount requested
 * @returns A promise of a list of posts uploaded by the user's `ID`.
 */
export async function getUserPostHistory(
  ID: number,
  from: number,
  range: number,
): Promise<Response> {
  const resURL = new URL(
    'http://localhost:8000/api/post/get-user-post-history',
  );
  resURL.searchParams.set('ID', ID.toString());
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

/**
 *
 * @param content The search term
 * @param from Start from
 * @param range The amount requested
 * @returns A promise of a list of posts uploaded by the content
 */
export async function getPostsFromQuery(
  content: string,
  from: number,
  range: number,
): Promise<Response> {
  const resURL = new URL('http://localhost:8000/api/post/search');
  resURL.searchParams.set('content', content);
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
