import { ValidImages } from "./images";

export interface Post {
	ID: number;
	postedBy: number;
	content: string;
	timeCreated: string;
	parentID: number;
	images: string;
}

/**
 * Get a post the ID
 * @param ID The identifaction of post
 */
export async function PostGetFromID(ID: number): Promise<Response> {
	const Res = await fetch(`/api/post/get-post-from-id/${ID}`);

	return Res;
}

/**
 * Similar to {@link PostFeed}, but with multiple posts
 * @param amount The amount of post you want to get
 * @returns Response
 */
export async function PostFeedList(amount: number): Promise<Response> {
	const FeedRes = await fetch(`/api/post/feedlist/${amount}`, {
		cache: "no-cache",
		mode: "no-cors",
		method: "GET"
	});

	return FeedRes;
}

/**
 * Gets a post from the database
 * @returns Response
 */
export async function PostFeed(): Promise<Response> {
	const FeedRes = await fetch("/api/post/feed", {
		cache: "no-cache",
		mode: "no-cors",
		method: "GET"
	});

	return FeedRes;
}

/**
 * Used for {@link AddPost}
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
export async function AddPost(Req: AddPostRequest): Promise<Response> {
	const imageCheck = ValidImages.test(Req.images);

	console.log(Req.images);

	if (!imageCheck && Req.images !== "") {
		throw new Error("Invalid image");
	}

	const AddRes = await fetch("/api/post/add", {
		cache: "no-cache",
		mode: "no-cors",
		method: "POST",
		headers: {
			"Content-Type": "appliction/json"
		},
		body: JSON.stringify(Req)
	});

	return AddRes;
}
