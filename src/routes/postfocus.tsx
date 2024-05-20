import { Component, createResource, Show } from "solid-js";
import Header from "../components/header";
import Sides from "../components/sides";
import PostUI, { PostProps } from "../components/post";
import { Post, PostGetFromID } from "../requests/post";
import { useParams } from "@solidjs/router";
import { OcArrowswitch2, OcSearch2 } from "solid-icons/oc";
import { DefaultUser, GetUserFromID, User } from "../requests/user";
import { Meta, Title } from "@solidjs/meta";

// TODO

function PostResource(ID: number): () => Promise<Post> {
	return async () => {
		try {
			const GetPost = await PostGetFromID(ID);

			return await GetPost.json();
		} catch (error) {
			console.error(error);

			const Placeholder: Post = {
				ID: 1,
				postedBy: 1,
				content: "",
				timeCreated: "",
				parentID: -1,
				images: ""
			};

			return Placeholder;
		}
	};
}

export async function CommentGetUser(ID: number): Promise<User> {
	try {
		const user = await GetUserFromID(ID);

		return user;
	} catch {
		return DefaultUser;
	}
}

const Comment: Component<PostProps> = props => {
	const Post = props.post;

	const [user] = createResource(CommentGetUser.bind(globalThis, Post.postedBy));

	const date = new Date(Post.timeCreated).toDateString();

	return (
		<Show when={!user.loading}>
			<div class='gap-2 grid grid-cols-post grid-rows-post w-post'>
				<img
					height={32}
					width={32}
					src={user()!.Profile}
					class='rounded-full'
				/>
				<div class='flex flex-col'>
					<h1 class='font-medium text-charcoal-950 text-ms leading-4'>
						@{user()!.handle}
					</h1>
					<sub class='text-charcoal-900 text-xs'>{date}</sub>
				</div>
				<p class='col-start-2 text-charcoal-950'>{Post.content}</p>
			</div>
		</Show>
	);
};

const PostFocus: Component = () => {
	const ID: number = parseInt(useParams().ID);

	const DefaultPost: Post = {
		content: "Hello World",
		parentID: 0,
		ID: -1,
		postedBy: 0,
		timeCreated: "",
		images: ""
	};

	const [Post] = createResource<Post>(PostResource(ID));

	const [user] = createResource(
		CommentGetUser.bind(globalThis, DefaultPost.postedBy)
	);

	return (
		<>
			<Show when={!Post.loading}>
				<Meta name='description' content={Post()!.content} />
			</Show>
			<Show when={!user.loading}>
				<Meta name='author' content={`@${user()!.handle}`} />
				<Title>CoffeeCo - @{user()!.handle}</Title>
			</Show>

			<Header />

			<Sides>
				<main class='flex flex-col items-center'>
					<Show when={!Post.loading}>
						<PostUI post={Post()!} />
					</Show>

					<hr class='mt-4 mb-2 border w-post text-charcoal-900/25' />

					<div class='flex flex-col gap-2 w-post'>
						<div class='flex items-center w-fit'>
							<OcSearch2 class='absolute text-charcoal-100 translate-x-2' />
							<input
								aria-label='comment-search'
								class='bg-persian-800 py-1 pr-2 pl-8 rounded w-fit text-charcoal-100 focus:outline-none placeholder:text-charcoal-100'
								placeholder='Search Comments'
							/>
						</div>

						<div class='flex items-center gap-2'>
							<OcArrowswitch2 />
							<label for='sorted-by' class='font-semibold text-charcoal-900'>
								Sort by:
							</label>
							<select
								id='sorted-by'
								class='bg-persian-700 px-2 py-1 rounded text-charcoal-100'
							>
								<option>Popular</option>
								<option>New</option>
								<option>Controversial</option>
							</select>
						</div>
					</div>

					<div class='flex flex-col gap-2 mx-auto pt-4 w-post'>
						<Comment post={DefaultPost} />
						<Comment post={DefaultPost} />
						<Comment post={DefaultPost} />
						<Comment post={DefaultPost} />
					</div>
				</main>
			</Sides>
		</>
	);
};

export default PostFocus;
