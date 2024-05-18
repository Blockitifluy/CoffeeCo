import { Meta } from "@solidjs/meta";
import Header from "../components/header";
import Sides from "../components/sides";
import { Component } from "solid-js";
import PostList from "../components/postlist";

/**
 * The main front page of website
 */
const MainPage: Component = () => {
	return (
		<>
			<Meta
				name='description'
				content='CoffeeCo is a place for Social Discussions, Art and Politics'
			/>
			<Header />

			<Sides>
				<main>
					<PostList amount={10} />
				</main>
			</Sides>
		</>
	);
};

export default MainPage;
