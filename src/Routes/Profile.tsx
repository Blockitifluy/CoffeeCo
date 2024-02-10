import { Component, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import { Meta } from "@solidjs/meta";
import { GetUserFromUserId, PublicUser } from "../Libraries/ApiConnector";
import TitleSetter from "../components/SetTitle";
import Header from "../components/Header";
import PostUI from "../components/Post";
import SideBars from "../components/SideBars";

const Profile: Component = () => {
	const params = useParams();

	console.log(params.id);

	const [Profile, SetProfile] = createSignal<PublicUser>({
		ID: 0,
		USERNAME: "Loading"
	});

	GetUserFromUserId(parseInt(params.id))
		.catch(reason => {
			console.error(reason);
		})
		.then((profile: PublicUser | void) => {
			if (!profile) {
				return;
			}

			console.log(profile);

			SetProfile(profile);
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
					<div class='relative bottom-8 w-full text-white'>
						<img
							class='h-32 w-32 aspect-square rounded-full shadow-lg'
							src='https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
							alt='Profile Image'
						/>
					</div>
					<h1 class='font-bold text-3xl text-slate-800'>
						{Profile().USERNAME}
					</h1>
					<p class='w-full h-max box-border text-slate-600'>
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum veniam
						aperiam, deserunt dolores porro.
					</p>

					<section class='mx-auto w-full py-8 overflow-x-clip flex flex-col items-center'>
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
