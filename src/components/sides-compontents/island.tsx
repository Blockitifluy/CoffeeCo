import { Component } from "solid-js";
import { A } from "@solidjs/router";
import { ChildrenProps } from "../../common";

export interface IslandLinkProps extends ChildrenProps {
	href: string;
	selected: boolean;
}

export const IslandLink: Component<IslandLinkProps> = props => {
	const background: string = props.selected ? "bg-slate-950/35" : "";

	return (
		<li class='w-full'>
			<A
				class={`flex flex-row items-center text-lg gap-1 font-medium text-charcoal-600 hover:bg-slate-950/25 active:bg-slate-950/35 pl-4 py-1 ${background} transition-colors`}
				href={props.href}
			>
				{props.children}
			</A>
		</li>
	);
};

export interface IslandProps extends ChildrenProps {
	title: string;
}

const Island: Component<IslandProps> = props => {
	return (
		<div class='bg-white drop-shadow-lg py-4 rounded text-charcoal-950'>
			<h1 class='ml-4 font-medium text-2xl'>{props.title}</h1>

			{props.children}
		</div>
	);
};

export default Island;
