import { Component, For, Show, createResource } from "solid-js";
import { GetPostsFromUser, Post, PostFeedList } from "../requests/post";
import PostUI from "./post";
import Logo256 from "../assets/logos/logo256.png";

/**
 * Used by {@link GetPostsGlobal}
 */
interface PostListReq {
	/** The posts response */
	Posts: Post[];
	/**Is request successful? */
	ok: boolean;
}

/**
 * The gets the amount of posts wanted
 * @param amount The amount of posts wanted
 * @returns
 */
async function GetPostsGlobal(amount: number): Promise<PostListReq> {
	try {
		const Res = await PostFeedList(amount);

		const JSON: Post[] = await Res.json();

		return { Posts: JSON, ok: Res.ok };
	} catch (error) {
		console.error(error);

		return { Posts: [], ok: false };
	}
}

async function GetPostUser(amount: number, ID: number): Promise<PostListReq> {
	try {
		const Res = await GetPostsFromUser(amount, ID);

		const JSON: Post[] = await Res.json();

		return { Posts: JSON, ok: Res.ok };
	} catch (error) {
		console.error(error);

		return { Posts: [], ok: false };
	}
}

/**
 * Appears when there is {@link PostList} has no posts
 */
const ListFallback: Component = () => {
	return (
		<div class='flex flex-col justify-center items-center gap-2'>
			<img src={Logo256} alt='CoffeeCo Logo' width={200} />
			<h1 class='font-semibold text-3xl text-center'>Couldn't load Posts</h1>
			<p class='text-center'>Something Went Wrong</p>
		</div>
	);
};

/**
 * The Properties of the {@link PostList} component
 * @property amount
 */
interface PostListProps {
	/**
	 * The amount of Posts in the PostList
	 */
	amount: number;
	ID?: number;
}

/**
 * Displayes the amount of Posts as requested
 * @param props The amount of the PostList
 */
const PostList: Component<PostListProps> = props => {
	const [posts] = createResource<PostListReq>(() => {
		if (props.ID) {
			return GetPostUser(props.amount, props.ID);
		}

		return GetPostsGlobal(props.amount);
	});

	return (
		<div class='flex flex-col items-center gap-4'>
			<Show when={!posts.loading || posts()?.ok}>
				<For each={posts()?.Posts} fallback={<ListFallback />}>
					{post => <PostUI post={post} />}
				</For>
			</Show>
		</div>
	);
};

export default PostList;
