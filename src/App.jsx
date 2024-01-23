// Libraries

import { For, createContext, createSignal, useContext } from "solid-js";

// Other

import logo from "./logo.svg";

// Components

import PostUI from "./components/Post";
import Header, { TagsContext } from "./components/Header";

// Contexts

function App() {
	const [tags, setTags] = createSignal([]);
	return (
		<TagsContext.Provider value={[tags, setTags]}>
			<Header />

			<section class='mx-auto w-[512px] py-8'>
				<PostUI />
				<PostUI />
			</section>
		</TagsContext.Provider>
	);
}

export default App;
