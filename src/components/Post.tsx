import { FormatedText } from "../Libraries/Formater";
import { Component } from "solid-js";

const PostUI: Component = () => {
	return (
		<div class='grid grid-cols-[32px_1fr] grid-rows-[32px_1fr] bg-white rounded-md mb-4 mt-4 p-4 gap-3 max-w-[30rem] items-center'>
			<img
				src='https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
				alt='username profile picture'
				height={32}
				width={32}
				class='rounded-full'
			/>

			<div class='flex flex-col'>
				<h1 class='font-medium'>Username</h1>
				<p class='text-slate-600 text-xs'>19:57 07/02/2024</p>
			</div>

			<FormatedText class='text-slate-800 col-start-2'>
				Lorem ipsum @dolor, sit amet consectetur adipisicing elit. Aliquam, ab!
				Voluptatem, tenetur `beatae` molestias hic quos ut, modi enim voluptates
				doloribus officiis dignissimos ad accusantium perspiciatis eligendi sunt
				atque. Dolores. #Hello World #World
			</FormatedText>
		</div>
	);
};

export default PostUI;
