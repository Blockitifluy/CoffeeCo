import { Component, For } from "solid-js";
import { A } from "@solidjs/router";
import getLeftLink from "../../sideurls";
import { ChildrenProps } from "../../common";

interface LeftLinkProps extends ChildrenProps {
	text: string;
	url: string;
	selected: boolean;
}

const LeftLink: Component<LeftLinkProps> = props => {
	const background: string = props.selected ? "bg-slate-950/35" : "";
	return (
		<li class='w-full'>
			<A
				class={`flex flex-row items-center text-lg gap-1 font-medium text-charcoal-600 hover:bg-slate-950/25 active:bg-slate-950/35 pl-4 py-1 ${background} transition-colors`}
				href={props.url}
			>
				{props.children}
				<span>{props.text}</span>
			</A>
		</li>
	);
};

const SideLinks: Component = () => {
	return (
		<div class='bg-white drop-shadow-lg py-4 rounded'>
			<h1 class='ml-4 pb-2 font-medium text-2xl text-charcoal-950'>Menu</h1>
			<ul class='flex flex-col items-start'>
				<For each={getLeftLink()}>
					{link => (
						<LeftLink
							url={link.url}
							text={link.text}
							selected={link.url === location.href}
						>
							{link.children}
						</LeftLink>
					)}
				</For>
			</ul>

			<hr class='border-slate-300 mx-4 my-1' />

			<A class='ml-4 text-base text-charcoal-900' href='/a'>
				Help?
			</A>
		</div>
	);
};

export default SideLinks;
