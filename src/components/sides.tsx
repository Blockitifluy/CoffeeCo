import FollowRecommend from "./sides-compontents/follow-recommend";
import LoginPrompt from "./sides-compontents/login-prompt";
import SideLinks from "./sides-compontents/side-links";
import Popular from "./sides-compontents/popular";

import { IsLoggedIn } from "../requests/user";
import { Component, Show } from "solid-js";
import { ChildrenProps } from "../common";

/**
 * The Right side of the {@link Sides}s
 */
const RightSide: Component = () => {
	return (
		<section class='top-2 sticky flex flex-col gap-4 px-4 rounded self-start'>
			<Popular />
			<FollowRecommend />
		</section>
	);
};

/**
 * The sides component is used in almost all pages
 */
const Sides: Component<ChildrenProps> = props => {
	return (
		<div class='justify-center grid grid-cols-miniheader lg:grid-cols-header md:mx-auto ml-4 pt-4 max-w-7xl'>
			<section class='lg:block hidden'>
				<Show when={IsLoggedIn()} fallback={<LoginPrompt />}>
					<SideLinks />
				</Show>
			</section>

			{props.children}

			<RightSide />
		</div>
	);
};

export default Sides;
