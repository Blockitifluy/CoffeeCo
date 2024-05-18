import { Component, JSX, Show, Setter, createSignal, For } from "solid-js";
import {
	OcPlus2,
	OcBell2,
	OcSearch2,
	OcChevrondown2,
	OcThreebars2
} from "solid-icons/oc";
import { A } from "@solidjs/router";
import Logo64 from "../assets/logos/logo64.png";
import { useUser } from "../contexts/usercontext";
import { IsLoggedIn } from "../requests/user";
import getLeftLink from "../sideurls";
import { ChildrenProps } from "../common";

// TODO Docs

interface HeaderLinksProps extends ChildrenProps {
	url: string;
	subtitle?: string;
	label?: string;
}

const HeaderLink: Component<HeaderLinksProps> = props => {
	return (
		<A
			aria-label={props.label}
			class='flex flex-row justify-center items-center text-2xl'
			href={props.url}
		>
			<p class='lg:block hidden mr-1 font-medium text-lg'>{props.subtitle}</p>
			{props.children}
		</A>
	);
};

interface HeaderButtonProps extends ChildrenProps {
	subtitle?: string;
	label?: string;
}

const HeaderButton: Component<HeaderButtonProps> = props => {
	return (
		<button
			aria-label={props.label}
			class='flex flex-row justify-center items-center text-2xl'
		>
			<p class='lg:block hidden mr-1 font-medium text-lg'>{props.subtitle}</p>
			{props.children}
		</button>
	);
};

const OnKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = e => {
	if (e.key !== "Enter") {
		return;
	}

	e.preventDefault();

	const value = (e.target as HTMLInputElement).value;

	if (value === "") {
		window.location.href = "/";
		return;
	}

	window.location.href = `/search/${encodeURIComponent(value)}`;
};

const HamburgerMenu: Component = () => {
	return (
		<div class='left-1 z-10 absolute bg-persian-600 drop-shadow rounded-b-lg w-48 h-fit'>
			<ul>
				<For each={getLeftLink()}>
					{item => (
						<HamburgerItem
							text={item.text}
							url={item.url}
							selected={item.url === location.href}
						>
							{item.children}
						</HamburgerItem>
					)}
				</For>
			</ul>
			<hr class='mx-2 text-persian-700' />
			<A
				href='/help'
				class='block my-1 ml-2 text-white hover:text-opacity-50 transition-colors'
			>
				Help?
			</A>
		</div>
	);
};

interface HamburgerItemProps extends ChildrenProps {
	text: string;
	url: string;
	selected: boolean;
}

const HamburgerItem: Component<HamburgerItemProps> = props => {
	const background = props.selected ? "bg-persian-700" : "bg-transparent";
	return (
		<li
			class={`${background} hover:bg-persian-700/25 transition-colors py-2 px-4`}
		>
			<A
				href={props.url}
				class='flex flex-row items-center gap-2 font-medium text-lg text-white'
			>
				{props.children}
				<span>{props.text}</span>
			</A>
		</li>
	);
};

/**
 * When the Hamburger icon is being clicked
 * @param setState The setter of the Hamburger state
 * @returns Hamburger Click Event
 */
function OnHamburgerClick(
	setState: Setter<boolean>
): JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> {
	return () => {
		setState(prev => !prev);
	};
}

/**
 * Contains:
 * - Hamburger (Mobile only),
 * - CoffeeCo Logo,
 * - Searchbar,
 * - Post Creation,
 * - Notification,
 * - Profile
 * @returns The Header Component
 */
const Header: Component = () => {
	const User = useUser();

	const [hamburgerEnabled, setHamburger] = createSignal<boolean>(false);

	return (
		<>
			<header class='bg-persian-600 px-4 py-4 w-full text-white'>
				<div class='grid grid-cols-header mx-auto max-w-5xl'>
					<section class='flex flex-row items-center gap-4'>
						<button
							aria-label='Hamburger Button'
							onClick={OnHamburgerClick(setHamburger)}
						>
							<OcThreebars2 class='block lg:hidden text-xl' />
						</button>
						<A href='/' class='flex flex-row items-center gap-4'>
							<img
								src={Logo64}
								width={36}
								height={36}
								class='block aspect-square'
								alt='CoffeeCo Logo'
							/>
							<h1 class='lg:block hidden font-bold text-4xl'>CoffeeCo</h1>
						</A>
					</section>

					<section class='flex flex-row justify-center items-center'>
						<OcSearch2 class='relative left-8 text-charcoal-100' />
						<input
							id='search'
							type='text'
							class='block bg-persian-700 pl-12 rounded w-full max-w-xl h-full text-white focus:outline-none placeholder:text-charcoal-100'
							placeholder='Search'
							maxLength={30}
							onKeyPress={OnKeyDown}
						/>
					</section>

					<section class='flex flex-row-reverse items-center gap-6 md:gap-4'>
						<Show when={IsLoggedIn()}>
							<div
								aria-label='Profile'
								class='flex flex-row-reverse items-center gap-1'
							>
								<OcChevrondown2 />
								<img
									src={User!.Profile}
									width={36}
									height={36}
									alt='Profile Image'
									class='rounded-full'
								/>
							</div>

							<HeaderButton subtitle='' label='Notification'>
								<OcBell2 />
								<div class='relative right-2 bottom-2 flex justify-center items-center bg-sandy-500 rounded-full w-4 h-4 text-sm aspect-square'>
									1
								</div>
							</HeaderButton>

							<HeaderLink url='/new-post' label='Create Post' subtitle='Create'>
								<OcPlus2 />
							</HeaderLink>
						</Show>
					</section>
				</div>
			</header>

			<Show when={hamburgerEnabled()}>
				<HamburgerMenu />
			</Show>
		</>
	);
};

export default Header;
