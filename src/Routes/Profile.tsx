import { Component } from "solid-js";
import Header from "../components/Header";
import PostUI from "../components/Post";
import TitleSetter from "../components/SetTitle";

const Profile: Component = () => {
	return (
		<>
			<TitleSetter title='CoffeeCo - Username' />
			<Header />
			<img
				src='https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Rm9yZXN0fGVufDB8fDB8fHww'
				alt='Landspace Image'
				class='w-full h-64 object-cover'
			/>
			<section class='mx-auto w-3/4 max-w-[648px]'>
				<div class='relative bottom-8 w-full text-white'>
					<img
						class='h-32 w-32 aspect-square rounded-full mb-8'
						src='https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
						alt='Profile Image'
					/>
					<h1 class='font-bold text-3xl'>Username</h1>
					<p class='w-full h-max box-border'>
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum veniam
						aperiam, deserunt dolores porro.
					</p>
				</div>

				<section class='mx-auto w-[512px] py-8 overflow-x-clip'>
					<PostUI />
					<PostUI />
					<PostUI />
					<PostUI />
					<PostUI />
					<PostUI />
					<PostUI />
				</section>
			</section>
		</>
	);
};

export default Profile;
