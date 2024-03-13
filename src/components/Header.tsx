import logo256 from "../assets/logos/logo256.png";
import { Component } from "solid-js";
import { OcSearch2, OcPerson2, OcBell2 } from "solid-icons/oc";
import { A } from "@solidjs/router";

/**
 * Note: Not to be mistaken as the builtin `header` element in html
 *
 * The component should use in _most_ pages excluding:
 * - Login
 * - Signup
 *
 * The component contains the icon; buttons such as:
 *
 * - Profile
 * - Notifaction
 *
 * And finally a searchbar.
 */
const Header: Component = () => {
	return (
		<header class='grid grid-cols-[1fr_2fr] grid-rows-1 flex-row justify-center items-center bg-persian-500 box-border'>
			<section class='flex flex-row items-center py-4 md:pl-16 mx-auto w-full pl-8'>
				<A href='/' class='pr-8 flex flex-row items-center'>
					<img src={logo256} alt='CoffeeCo Logo' width={48} />
					<h1 class='font-semibold text-2xl text-white mr-8 sm:block hidden ml-4'>
						CoffeeCo
					</h1>
				</A>

				<A href='/users/1' class='mr-4'>
					<OcPerson2
						size={24}
						class='text-persian-100 hover:text-persian-400 active:text-persian-700 transition-colors'
					/>
				</A>

				<button>
					<OcBell2
						size={24}
						class='text-persian-100 hover:text-persian-400 active:text-persian-700 transition-colors'
					/>
				</button>
			</section>
			<section class='flex-row-reverse flex items-center py-4 md:pr-16 pr-8'>
				<input
					placeholder='Search for Hot Topics'
					class='min-w-64 h-10 rounded-lg pr-2 pl-10 w-fit text-ellipsis bg-persian-700 placeholder:text-slate-300 text-white focus:outline-1 focus:outline-white focus:bg-persian-500 focus:shadow-xl sm:min-w-min'
					id='searchbar'
					type='text'
				/>
				<OcSearch2 class='relative left-8 text-slate-300' />
			</section>
		</header>
	);
};

export default Header;
