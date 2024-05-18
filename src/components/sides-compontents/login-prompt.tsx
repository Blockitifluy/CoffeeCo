import { Component } from "solid-js";
import { A } from "@solidjs/router";
import Island from "./island";

const LoginPrompt: Component = () => {
	return (
		<section class='top-2 sticky flex flex-col gap-4 px-4 rounded self-start'>
			<Island title='Not Logged In'>
				<p class='ml-4 py-2'>It seems like you are not Logged in</p>
				<h2 class='ml-4 py-1 font-medium text-lg'>Try:</h2>
				<div class='flex flex-row justify-around mx-auto mt-1 max-w-48'>
					<A
						href='/sign-up'
						class='bg-persian-600 px-2 py-1 rounded text-white'
					>
						Sign up
					</A>
					<A
						href='/log-in'
						class='bg-charcoal-700 px-2 py-1 rounded text-white'
					>
						Log in
					</A>
				</div>
			</Island>
		</section>
	);
};

export default LoginPrompt;
