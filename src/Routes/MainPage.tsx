/* eslint-disable linebreak-style */
// Libraries

import { Component } from "solid-js";

import { Title, Meta } from "@solidjs/meta";

// Other

// Components

import PostUI, { ProfileImage } from "../components/Post";

import Header from "../components/Header";

import { OcLightbulb2 } from "solid-icons/oc";

// Contexts

const CreatePost: Component = () => {
	const Tips: string[] = [
		"_text_ can put italics into your text",

		"Using *text* can bolden your text!",

		"#Hashtag can relate your post to "
	];

	const chosen: string = Tips[Math.round(Math.random() * (Tips.length - 1))];

	return (
		<form class='flex flex-col'>
			<ProfileImage
				image='https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
				username='You'
			/>

			<textarea
				name='Post'
				placeholder='Write Post Here'
				class='w-full min-h-32 rounded-md p-2 mb-5 focus:outline-none bg-slate-600 text-white'
			></textarea>

			<button
				type='button'
				class='bg-indigo-700 text-white w-fit p-2 rounded-md hover:bg-indigo-800 mb-3'
			>
				Submit
			</button>

			<sub class='text-slate-100 text-sm border-t-2 border-indigo-600 pt-2 flex'>
				<OcLightbulb2 size={24} class='mr-4 text-indigo-600' /> Tip of the Day:{" "}
				{chosen}
			</sub>
		</form>
	);
};

const MainPage: Component = () => {
	return (
		<>
			<Title>CoffeeCo</Title>

			<Meta name='description' content='A open-source social media account' />

			<Meta charset='UTF-8' />

			<Meta name='author' content='Blockitifluy' />

			<Meta name='viewport' content='width=device-width, initial-scale=1.0' />

			{/*<TitleSetter title='CoffeeCo' />*/}

			<Header />

			<div class='bg-gradient-to-b from-indigo-600 h-80'>
				<div class='h-full w-[512px] mx-auto pt-6 flex-col flex justify-center'>
					<h1 class='text-white text-2xl font-semibold w-full text-center'>
						Welcome to CoffeeCo
					</h1>

					<p class='mt-6 text-center text-slate-300 h-fit'>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
						maxime, illum voluptatem dicta quis, omnis dignissimos delectus
						praesentium explicabo nulla quia saepe sequi consequuntur id eaque
						rem assumenda sapiente aspernatur!
					</p>

					<div class='flex justify-evenly my-8'>
						<a class='p-2 bg-indigo-700 text-white rounded-md' href='/signin'>
							Sign in
						</a>

						<a href='/login' class='p-2 bg-indigo-700 text-white rounded-md'>
							Log in
						</a>

						<button class='p-2 bg-slate-700 text-white rounded'>
							About Us
						</button>
					</div>
				</div>
			</div>

			<div class='mx-auto w-[512px] py-8'>
				<CreatePost />

				<section class='overflow-x-clip'>
					<PostUI />

					<PostUI />

					<PostUI />

					<PostUI />

					<PostUI />

					<PostUI />

					<PostUI />
				</section>
			</div>
		</>
	);
};

export default MainPage;
