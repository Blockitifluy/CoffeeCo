import { Component, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import Header from "../components/Header";
import PostUI from "../components/Post";
import TitleSetter from "../components/SetTitle";

interface Profile {
	ID: number;
	USERNAME: string;
}

async function GetUserFromID(id: string): Promise<Profile> {
	try {
		let res = await fetch(`http://localhost:8000/api/user/getfromid/${id}`);

		if (!res.ok) {
			return { ID: 0, USERNAME: `ERROR - ${res.status}` };
		}

		const json: Profile = await res.json();

		return json;
	} catch (error) {
		return { ID: 0, USERNAME: `ERROR - ${error}` };
	}
}

const Profile: Component = () => {
	const params = useParams();

	console.log(params.id);

	const [Profile, SetProfile] = createSignal<Profile>({
		ID: 0,
		USERNAME: "Loading"
	});

	GetUserFromID(params.id).then((profile: Profile) => {
		console.log(profile);

		SetProfile(profile);
	});

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
					<h1 class='font-bold text-3xl'>{Profile().USERNAME}</h1>
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
