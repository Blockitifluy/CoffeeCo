import { Component, JSX, createSignal, Show, For } from "solid-js";
import {
	OcPeople2,
	OcFlame2,
	OcArrowboth2,
	OcHash2,
	OcHome2
} from "solid-icons/oc";
import { A } from "@solidjs/router";
import logo256 from "../assets/logos/logo256.png";
import Cookies from "js-cookie";

interface SideBarsProps {
	children: JSX.Element;
	canCreatePost?: boolean;
}

interface PostContent {
	text: string;
}

const PostForm: Component = () => {
	const maxLength = 100;

	const [PostContent, setPostContent] = createSignal<PostContent>({
		text: ""
	});

	const OnSubmit = (event: MouseEvent) => {
		event.preventDefault();
	};

	const onPostTyped: JSX.InputEventHandlerUnion<
		HTMLTextAreaElement,
		InputEvent
	> = event => {
		const Content: PostContent = Object.assign({}, PostContent());
		Content.text = event.target.value;

		setPostContent(Content);
	};

	return (
		<form class='grid grid-rows-1 grid-cols-[48px_1fr] bg-white p-4 max-w-[30rem] rounded gap-1'>
			<img src={logo256} alt='' width={48} />

			<div>
				<h1 class='text-2xl font-semibold my-2 text-slate-800'>Profile</h1>
				<textarea
					onInput={onPostTyped}
					maxLength={maxLength}
					class='w-full resize-none h-fit text-ellipsis focus:outline-none'
					placeholder='What do you want to say'
					onKeyPress={event => {
						console.log(event.key);

						if (event.key === "Enter") {
							event.preventDefault();
						}
					}}
					rows={4}
					cols={30}
				/>
				<p class='text-slate-700 text-sm mb-2'>
					{PostContent().text.length}/{maxLength}
				</p>
				<button
					type='submit'
					class='bg-persian-700 text-white p-1 rounded'
					onClick={OnSubmit}
				>
					Submit
				</button>
			</div>
		</form>
	);
};

const SideBars: Component<SideBarsProps> = (props: SideBarsProps) => {
	const LoginCookie = Cookies.get("LOGIN");

	const Hashtags: string[] = [
		"helloworld",
		"loremipsum",
		"placeholder",
		"fortnite",
		"coffeeco",
		"taylorswift"
	];

	console.log(LoginCookie);

	return (
		<div class='grid grid-rows-1 grid-cols-[1fr_2fr_1fr] w-full'>
			<section class='p-4 flex flex-col h-fit sticky top-0 self-start items-left'>
				<Show
					when={LoginCookie !== undefined}
					fallback={
						<>
							<p class='text-slate-600'>
								Doesn't look like you are logged in, try:
							</p>
							<div class='flex flex-row my-4 justify-start pl-4'>
								<a
									href='/signup'
									class='p-2 bg-persian text-white rounded mr-4'
								>
									Sign up
								</a>
								<a href='/login' class='p-2 bg-white text-slate-600 rounded'>
									Log in
								</a>
							</div>
							<p class='text-slate-600'>
								By joining CoffeeCo you can continue supporting this project,
								and could possibly inspire others to make other projects
								similar.
							</p>
						</>
					}
				>
					<Show
						when={
							props.canCreatePost === undefined ? true : props.canCreatePost
						}
					>
						<PostForm />
					</Show>

					<div class='flex flex-col h-fit w-full mt-5'>
						<A href='/' class='text-xl text-slate-600 mb-2'>
							<OcHome2 class='inline mr-2 text-persian-600' />
							Home
						</A>

						<A href='' class='text-xl text-slate-600 mb-2'>
							<OcPeople2 class='inline mr-2 text-persian-600' />
							Friends
						</A>

						<A href='' class='text-xl text-slate-600 mb-2'>
							<OcFlame2 class='inline mr-2 text-persian-600' />
							Hot Topics
						</A>

						<A href='' class='text-xl text-slate-600 mb-2'>
							<OcArrowboth2 class='inline mr-2 text-persian-600' />
							Private Messages
						</A>
					</div>
				</Show>
			</section>

			{props.children}

			<section class='p-4 flex flex-col sticky top-0 h-fit self-start w-full'>
				<div class='flex flex-row flex-wrap'>
					<h1 class='text-lg mb-1 font-medium w-fit text-slate-600 mr-2'>
						Popular Right Now
					</h1>
					<select class='mb-2 w-fit focus:outline-none rounded-md p-1 text-xs font-medium capitalize'>
						<option value='world'>worldwide</option>
						<option value='local'>in my area</option>
					</select>
				</div>

				<ul class='text-sienna-400 text-lg w-full my-2'>
					<For each={Hashtags}>
						{tag => (
							<li class='list-item mb-1'>
								<a>
									<OcHash2 class='inline text-sienna-400 text-xl hover:text-sienna-900' />
									{" " + tag}
								</a>
							</li>
						)}
					</For>
				</ul>

				<p class='text-slate-600'>
					Copyright &copy; 2024 <br /> All right reserved to Blockitifluy
				</p>
			</section>
		</div>
	);
};

export default SideBars;
