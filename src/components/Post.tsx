import { JSX } from "solid-js/jsx-runtime";
import { FormatedText } from "../Libraries/Utilities";
import logo from "../logo.png";
import { Component } from "solid-js";

export interface PostRequest {
	content: string;
	userId: number;
	images: string[]; //Max of 4
	poll: { name: string; votes: number }[];
}

export interface ProfileImageProps {
	image: string;
	username: string;
}

export const ProfileImage: Component<ProfileImageProps> = (
	props: ProfileImageProps
) => {
	return (
		<div class='flex items-center mb-3'>
			<img
				src={props.image}
				alt='Profile Image'
				class='h-8 w-8 aspect-square bg-indigo-600 mr-2 rounded-full'
			/>
			<h1 class='text-2xl mb-0 ml-2 font-semibold text-left text-white'>
				{props.username}
			</h1>
		</div>
	);
};

const PostUI: Component = () => {
	return (
		<div class='border-b-2 py-4 mt-12 border-slate-500 text-white'>
			<ProfileImage
				image='https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
				username='LoremIpsumLover'
			/>

			<FormatedText
				text='Lorem ipsum @dolor, sit amet consectetur adipisicing elit. Aliquam, ab!
				Voluptatem, tenetur beatae molestias hic quos ut, modi enim voluptates
				doloribus officiis dignissimos ad accusantium perspiciatis eligendi sunt
				atque. Dolores. #Hello World #World'
			/>
		</div>
	);
};

export default PostUI;
