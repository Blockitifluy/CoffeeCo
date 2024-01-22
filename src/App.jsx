// Libraries

import { For, createContext, createSignal, useContext } from "solid-js";
import { removeItemOnce } from "./Libraries/Utilities";

// Other

import logo from './logo.svg';
import styles from './App.module.scss';

// Components

import PostUI from './components/Post';
import Header from "./components/Header";

// Contexts

const TagsContext = createContext([[], () => {}])

function TagItem(props)
{
	const sliceRange = 20;
	const [tags, setTags] = useContext(TagsContext);

	const Remove = (_) => {
		const index = props.index;
		console.log(props);

		const result = removeItemOnce([...(tags())], index);

		setTags(result);
	}

	const tagStr = props.tag.slice(0, sliceRange - 3) + (props.tag.length > sliceRange - 3 ? '...' : '');

	return (
		<li class={styles.tag_item} title={props.tag}>
			{tagStr}
			<button onClick={Remove} type="button"></button>
		</li>
	)
}

function TagSelector() {
	const [tags, setTags] = useContext(TagsContext),
	[text, setText] = createSignal('')

	const AddButton = () => {
		console.log("Add Buttons");
		setTags([...(tags()), text()]);
	}

	const OnTextInput = (event) => {
		/**@type string */
		const value = event.target.value;

		setText(value.toLowerCase().replace(/[^a-zA-Z\d]/g, ''));
	} 

	return (
		<div class={`${styles.tag_selector} ${styles.post}`}>
			<h1>Tag Selection</h1>
			<section>
				<Show when={tags().length !== 0} fallback={<p>Not Filtering Tags</p>}>
					<For each={tags()}>{(tag, i) => <TagItem index={i()} tag={tag}/>}</For>
				</Show>
			</section>
			
		 <section>
			<div>
				<input type="text" onChange={OnTextInput} placeholder='Tag (no spaces)'/>
				<button onClick={AddButton}></button>
			</div>
			<button type="reset"><span></span>Refresh</button>
		 </section>

		</div>
	)
}

function App() {
	const [tags, setTags] = createSignal([]);
	return (
		<TagsContext.Provider value={[tags, setTags]}>
			<Header styles={styles}/>

			<section class={styles.content}>
				<TagSelector/>
				<PostUI styles={styles}/>
			</section>
		</TagsContext.Provider>
	);
}

export default App;
