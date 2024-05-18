import { Component } from "solid-js";
import { OcHash2 } from "solid-icons/oc";
import Island, { IslandLink } from "./island";

interface HashtagProps {
	text: string;
}

const Hashtag: Component<HashtagProps> = props => {
	const href = `/search/?h=${encodeURIComponent(props.text)}`;

	return (
		<IslandLink href={href} selected={false}>
			<OcHash2 />
			<span>{props.text}</span>
		</IslandLink>
	);
};

export const Popular: Component = () => {
	return (
		<Island title='Popular'>
			<select
				aria-label='Where?'
				name='Hastags'
				id='hashtags'
				class='border-2 border-charcoal-700 ml-4 rounded w-fit text-charcoal-700 text-xs'
			>
				<option value='Worldwide'>Worldwide</option>
				<option value='Locally'>Locally</option>
			</select>

			<ul class='mt-2'>
				<Hashtag text='drake' />
				<Hashtag text='likethat' />
				<Hashtag text='science' />
				<Hashtag text='kendrick' />
			</ul>
		</Island>
	);
};

export default Popular;
