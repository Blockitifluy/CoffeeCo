import { FormatedText } from "../Libraries/Formater";
import { Component } from "solid-js";

export interface PostRequest {
	content: string;
	userId: number;
	images: string[]; //Max of 4
	poll: { name: string; votes: number }[];
}

const PostUI: Component = () => {
	return (
		<div class='grid grid-rows-1 grid-cols-[32px_1fr] bg-white rounded-md mb-4 mt-4 p-4 gap-4 max-w-[30rem]'>
			<img
				src='https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
				alt='username profile picture'
				height={32}
				width={32}
				class='rounded-full'
			/>
			<div class='flex flex-col'>
				<div class='h-full'>
					<h1 class='font-medium'>Username</h1>
					<p class='text-slate-600'>19:57 07/02/2024</p>
				</div>

				<FormatedText class='text-slate-800'>
					Lorem ipsum @dolor, sit amet consectetur adipisicing elit. Aliquam,
					ab! Voluptatem, tenetur `beatae` molestias hic quos ut, modi enim
					voluptates doloribus officiis dignissimos ad accusantium perspiciatis
					eligendi sunt atque. Dolores. #Hello World #World
				</FormatedText>
			</div>
		</div>
	);
	/*return (
		<div class='py-4 mt-4 mb-12 bg-white px-6 rounded-xl text-white shadow-xl max-w-[36rem]'>
			<ProfileImage
				image=''
				username='LoremIpsumLover'
			/>

			<FormatedText
				class='text-slate-200'
				text='Lorem ipsum @dolor, sit amet consectetur adipisicing elit. Aliquam, ab!
				Voluptatem, tenetur `beatae` molestias hic quos ut, modi enim voluptates
				doloribus officiis dignissimos ad accusantium perspiciatis eligendi sunt
				atque. Dolores. #Hello World #World'
			/>
		</div>
	);*/
};

export default PostUI;
