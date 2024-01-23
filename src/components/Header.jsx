import logo from "../logo.svg";

import { For, createContext, createSignal, useContext } from "solid-js";
import { removeItemOnce } from "../Libraries/Utilities";

export const TagsContext = createContext([[], () => {}]);

function TagItem(props) {
	const sliceRange = 15;
	const [tags, setTags] = useContext(TagsContext);

	const Remove = _ => {
		const index = props.index;
		console.log(props);

		const result = removeItemOnce([...tags()], index);

		setTags(result);
	};

	const tagStr =
		props.tag.slice(0, sliceRange - 3) +
		(props.tag.length > sliceRange - 3 ? "... " : " ");

	return (
		<li
			title={props.tag}
			class='bg-indigo-500 text-white mx-2 w-fit h-7 list-none rounded-md flex items-center'
		>
			{tagStr}
			<button onClick={Remove} type='button'>
				X
			</button>
		</li>
	);
}

function TagSelector() {
	const [tags, setTags] = useContext(TagsContext),
		[text, setText] = createSignal("");

	const AddButton = () => {
		console.log("Add Buttons");

		console.log(tags().length);

		if (tags().length > 3) {
			return;
		}

		setTags([...tags(), text()]);
	};

	const OnTextInput = event => {
		/**@type string */
		const value = event.target.value;

		setText(value.toLowerCase().replace(/[^a-zA-Z\d]/g, ""));
	};

	return (
		<div class='mt-3 w-full h-1/4 rounded-lg'>
			<section class='flex w-full justify-center items-center bg-indigo-700 overflow-x-auto h-[40px]'>
				<Show
					when={tags().length !== 0}
					fallback={<p class='text-white'>Not Filtering Tags</p>}
				>
					<For each={tags()}>
						{(tag, i) => <TagItem index={i()} tag={tag} />}
					</For>
				</Show>

				<div class='h-7 flex ml-8'>
					<input
						type='text'
						onChange={OnTextInput}
						placeholder='Tag (no spaces)'
						class='rounded-l-md h-full'
					/>
					<button class='bg-white rounded-r-md h-full px-1' onClick={AddButton}>
						+
					</button>
				</div>
			</section>
		</div>
	);
}

function Header(props) {
	return (
		<header class='flex justify-center items-center bg-indigo-600  h-30 p-2 drop-shadow-xlg flex-col'>
			<nav class='grid grid-cols-h-layout grid-rows-1 w-full h-3/4'>
				<div class='flex justify-center items-center'>
					<img src={logo} alt='' class='mr-8 h-10' />
					<h1 class=' text-white text-lg font-medium'>CoffeeCo</h1>
				</div>

				<div class='flex justify-center items-center'>
					<input
						class=' h-full w-96 pl-4 rounded bg-indigo-700 border-2 placeholder:text-slate-200 text-white border-white'
						type='text'
						placeholder='Search'
					/>
				</div>

				<div class='flex justify-center items-center'>
					<button class='text-white hover:text-slate-400 transition-colors m-2'>
						Profile
					</button>
					<button class='text-white hover:text-slate-400 transition-colors m-2'>
						About Us
					</button>
					<button class='text-white transition-colors m-2 bg-indigo-700 p-2 rounded-lg hover:bg-indigo-800'>
						Log Out
					</button>
				</div>
			</nav>

			<TagSelector />
		</header>
	);
}

export default Header;
