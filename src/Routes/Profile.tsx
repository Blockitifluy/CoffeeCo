import { Component, Show, createSignal, onMount } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { Meta } from "@solidjs/meta";
import {
	AuthToId,
	GetUserFromUserId,
	PublicUser
} from "../Libraries/ApiConnector";
import TitleSetter from "../components/SetTitle";
import Header from "../components/Header";
import PostUI from "../components/Post";
import SideBars from "../components/SideBars";

/**
 * The profile page based on the URL given in the browser
 * @returns Profile Page
 */
const Profile: Component = () => {
	const params = useParams();

	const [Profile, SetProfile] = createSignal<PublicUser>({
		ID: 0,
		USERNAME: "Loading"
	});

	const [OwnsProfile, SetOwns] = createSignal<boolean>(false);

	onMount(async () => {
		try {
			// Page's profiles
			const userId = parseInt(params.id),
				User = await GetUserFromUserId(userId);

			console.log(User);

			SetProfile(User);

			// Owns Profile
			const ownId = await AuthToId();

			SetOwns(ownId === userId);
		} catch (err) {
			console.error(err);
		}
	});

	return (
		<>
			<TitleSetter title={`CoffeeCo - ${Profile().USERNAME}`} />
			<Meta
				name='description'
				content={`View ${Profile().USERNAME} - A open-source social media app`}
			/>

			<Meta charset='UTF-8' />

			<Meta name='author' content='Blockitifluy' />

			<Meta name='viewport' content='width=device-width, initial-scale=1.0' />

			<Header />

			<img
				src='https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Rm9yZXN0fGVufDB8fDB8fHww'
				alt='Landspace Image'
				class='w-full h-64 object-cover'
			/>

			<SideBars canCreatePost={false}>
				<section class='mx-auto w-3/4 max-w-[648px]'>
					<div class='relative bottom-8 w-full text-white flex flex-col'>
						<img
							class='size-32 aspect-square rounded-full shadow-lg'
							src='https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
							alt='Profile Image'
						/>
					</div>

					<h1 class='font-bold text-3xl text-slate-800'>
						{Profile().USERNAME}
					</h1>

					<p class='w-full mb-2 h-max box-border text-slate-600'>
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum veniam
						aperiam, deserunt dolores porro.
					</p>

					<Show when={OwnsProfile()}>
						<A
							class='bg-persian-500 p-1 rounded text-slate-200 text-center'
							href='/'
						>
							Edit Profile
						</A>
					</Show>

					<section class='mx-auto w-full py-2 overflow-x-clip flex flex-col items-center'>
						<PostUI />
						<PostUI />
						<PostUI />
						<PostUI />
						<PostUI />
						<PostUI />
						<PostUI />
					</section>
				</section>
			</SideBars>
		</>
	);
};

export default Profile;
