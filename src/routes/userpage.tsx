import Header from "../components/header";
import Sides from "../components/sides";
import {
	Component,
	createContext,
	Show,
	useContext,
	createResource,
	JSX
} from "solid-js";
import { DefaultUser, GetUserFromID } from "../requests/user";
import { useParams } from "@solidjs/router";
import PostList from "../components/postlist";

const PageUser = createContext(DefaultUser);

// TODO: ADD THIS PAGE

const UserInfo: Component = () => {
	const User = useContext(PageUser);

	const BannerImage: JSX.CSSProperties = {
		"background-image": `url(${User.Banner})`
	};

	return (
		<div class='flex flex-col gap-2 max-w-xl'>
			<div
				style={BannerImage}
				class='grid grid-rows-2 bg-cover bg-no-repeat bg-center py-2 rounded w-[36rem]'
			>
				<section class='flex flex-row items-center row-start-2 p-2'>
					<img
						src={User.Profile}
						alt={`User Profile for @${User.handle}`}
						class='rounded-full'
						width={100}
						height={100}
					/>

					<div class='gap-4 grid grid-rows-2 ml-4'>
						<h1 class='font-semibold text-2xl'>{User.username}</h1>
						<sub class='text-md'>@{User.handle}</sub>
					</div>
				</section>
			</div>

			<h2 class='font-semibold text-xl'>About Me</h2>
			<p>{User.bio}</p>
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

					<PostList amount={10} />
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
