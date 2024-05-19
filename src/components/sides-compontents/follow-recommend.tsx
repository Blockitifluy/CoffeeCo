import { Component } from "solid-js";
import Island, { IslandLink } from "./island";
import { DefaultUser } from "../../requests/user";

const FollowItem: Component = () => {
	return (
		<IslandLink href='' selected={false}>
			<img
				src={DefaultUser.Profile}
				alt={`@${DefaultUser.handle}'s Profile`}
				class='rounded-full'
				width={24}
				height={24}
			/>
			<h2 class='font-medium'>Username</h2>
		</IslandLink>
	);
};

const FollowRecommend: Component = () => {
	return (
		<Island title='Intresting People'>
			<ul>
				<FollowItem />
				<FollowItem />
				<FollowItem />
			</ul>
		</Island>
	);
};

export default FollowRecommend;
