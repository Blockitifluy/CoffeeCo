import { DeformatImages, ImageObj, ValidImages } from "../requests/images";
import { OcComment2, OcThumbsdown2, OcThumbsup2 } from "solid-icons/oc";
import { DefaultUser, GetUserFromID, User } from "../requests/user";
import { Show, Component, createResource, For } from "solid-js";
import ProfileIcon from "../assets/DefaultLogo.png";
import { Post as PostType } from "../requests/post";
import { ChildrenProps } from "../common";
import { A } from "@solidjs/router";

/**
 * The propetries of {@link PostSkeleton}
 */
export interface PostSkeletonProps extends ChildrenProps {
	/**
	 * A post's title, such as a username
	 */
	title: string;
	/**
	 * A subtitle for a post, such as a date
	 */
	subtitle: string;
}

/**
 * A post's skeleton
 * @param props children, title and subtitle
 */
export const PostSkeleton: Component<PostSkeletonProps> = props => {
	return (
		<div class='gap-2 grid grid-cols-post grid-rows-post bg-white drop-shadow-lg px-4 py-6 rounded w-post h-fit'>
			<img
				src={ProfileIcon}
				width={32}
				height={32}
				class='rounded-full'
				alt=''
			/>

			<div class='flex flex-col justify-center'>
				<h1 class='font-medium text-charcoal-950 text-ms leading-4'>
					{props.title}
				</h1>
				<sub class='text-charcoal-700 text-xs'>{props.subtitle}</sub>
			</div>

			{props.children}
		</div>
	);
};

/**
 * Propetries for a {@link PostButton}
 */
interface PostButtonProps extends ChildrenProps {
	/**
	 * Button's text
	 */
	text: string;
	/**
	 * The button an `a` or a `button`
	 */
	isButton: boolean;
	/**
	 * A provided url for an `a`
	 */
	url?: string;
}

/**
 * The Post's button displayed at the bottom of a post
 * @param props A button's text and url (and is a button)
 */
const PostButton: Component<PostButtonProps> = props => {
	return props.isButton ? (
		<button class='flex flex-row items-center gap-1 text-charcoal-700 text-sm'>
			{props.children}
			<span>{props.text}</span>
		</button>
	) : (
		<A
			href={props.url || "/not-found"}
			class='flex flex-row items-center gap-1 text-charcoal-700 text-sm'
		>
			{props.children}
			<span>{props.text}</span>
		</A>
	);
};

/**
 * A loading post
 */
export const DummyPost: Component = () => {
	return (
		<PostSkeleton title='Waiting for Response' subtitle='loading'>
			<div class='col-start-2 w-full'>
				<p class='text-charcoal-950'>loading</p>
			</div>
		</PostSkeleton>
	);
};

/**
 * Get a user from a User's Post
 * @param post The post Object
 * @returns A function to get a User Promise
 */
function UserResource(post: PostType): () => Promise<User> {
	return async () => {
		try {
			const usr = await GetUserFromID(post.postedBy);

			return usr;
		} catch (error) {
			console.error(error);

			return DefaultUser;
		}
	};
}

/**
 * Propetries for {@link PostImages}
 */
export interface PostImageProps {
	/**
	 * A `image` list
	 * @see ValidImages
	 */
	images: string;
}

/**
 * A subcomponent of a {@link PostUI Post's} images
 * @param props an `images` string
 */
const PostImages: Component<PostImageProps> = props => {
	const ref: ImageObj[] = DeformatImages(props.images);

	return (
		<section class='flex justify-center gap-2'>
			<For each={ref}>
				{image => (
					<img
						src={image.src}
						width={400 / ref.length}
						class='rounded-lg'
						alt={image.alt}
					/>
				)}
			</For>
		</section>
	);
};

/**
 * Propetries for {@link PostUI}
 */
export interface PostProps {
	post: PostType;
}

/**
 * Shows a {@link PostType post} as a UI component
 * @param props A {@link PostType} Object
 */
const PostUI: Component<PostProps> = props => {
	const pst = props.post;

	const [user] = createResource<User>(UserResource(pst));

	const date = new Date(pst.timeCreated).toDateString();

	return (
		<Show when={!user.loading} fallback={<DummyPost />}>
			<PostSkeleton title={`@${user()!.handle}`} subtitle={date}>
				<div class='flex flex-col gap-2 col-start-2'>
					<p class='text-charcoal-950'>{pst.content}</p>

					<Show when={ValidImages.test(pst.images)}>
						<PostImages images={pst.images} />
					</Show>

					<div class='flex flex-rows gap-3 text-lg'>
						<PostButton text='197' url={`/post/${pst.ID}`} isButton={false}>
							<OcComment2 />
						</PostButton>

						<PostButton text='200' isButton={true}>
							<OcThumbsup2 />
						</PostButton>

						<PostButton text='20' isButton={true}>
							<OcThumbsdown2 />
						</PostButton>
					</div>
				</div>
			</PostSkeleton>
		</Show>
	);
};

export default PostUI;
