import Header from "../components/header";
import Sides from "../components/sides";
import {
	Component,
	createContext,
	Show,
	useContext,
	createResource
} from "solid-js";
import { DefaultUser, GetUserFromID } from "../requests/user";
import { useParams } from "@solidjs/router";
import PostList from "../components/postlist";

const PageUser = createContext(DefaultUser);

// TODO: ADD THIS PAGE

const UserInfo: Component = () => {
	const User = useContext(PageUser);

	return (
		<div class='gap-1 grid grid-cols-[1fr_4fr] bg-white drop-shadow-lg p-4 rounded max-w-lg'>
			<section class='flex flex-col gap-2 pb-2'>
				<img class='rounded-full' width={90} src={User.Profile} />
				<h1 class='font-medium text-2xl'>{User.username}</h1>
				<sub>@{User.handle}</sub>
			</section>

			<section class='flex flex-col justify-around'>
				<h2 class='font-semibold text-xl'>About Me</h2>
				<p>
					Lorem ipsum dolor sit, amet consectetur adipisicing elit. Cum quae quo
					sit repudiandae, expedita deleniti iure veritatis recusandae aliquam
					consequuntur odio, tempora architecto? Magnam adipisci deleniti totam
					voluptate cumque ratione.
				</p>
			</section>
		</div>
	);
};

const UserPage: Component = () => {
	return (
		<>
			<Header />

			<Sides>
				<main class='flex flex-col items-center gap-8'>
					<UserInfo />

					<PostList amount={1} />
				</main>
			</Sides>
		</>
	);
};

const PageWrapper = () => {
	const DEBUG: boolean = import.meta.env.DEV;

	const ID: number = parseInt(useParams()["ID"]);

	const [user] = createResource(() => {
		try {
			return GetUserFromID(ID);
		} catch {
			return DefaultUser;
		}
	});

	return DEBUG ? (
		<PageUser.Provider value={user()!}>
			<UserPage />
		</PageUser.Provider>
	) : (
		<Show when={user()}>
			<PageUser.Provider value={user()!}>
				<UserPage />
			</PageUser.Provider>
		</Show>
	);
};

export default PageWrapper;
