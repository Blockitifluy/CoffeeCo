/* eslint-disable linebreak-style */
// Libraries

import { Component } from "solid-js";

import { Meta } from "@solidjs/meta";
import TitleSetter from "../components/SetTitle";
// Other

// Components

import PostUI from "../components/Post";
import SideBars from "../components/SideBars";
import Header from "../components/Header";

// Contexts

const MainPage: Component = () => {
	return (
		<>
			<TitleSetter title='CoffeeCo' />

			<Meta name='description' content='A open-source social media app' />

			<Meta charset='UTF-8' />

			<Meta name='author' content='Blockitifluy' />

			<Meta name='viewport' content='width=device-width, initial-scale=1.0' />

			<Header />

			<SideBars>
				<main class='flex flex-col items-center'>
					<PostUI />
					<PostUI />
					<PostUI />
					<PostUI />
					<PostUI />
					<PostUI />
				</main>
			</SideBars>
		</>
	);
};

export default MainPage;
