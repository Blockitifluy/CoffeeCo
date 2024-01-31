import logo256 from "../logos/logo256.png";

import { Component } from "solid-js";
import { OcBook2, OcPerson2 } from "solid-icons/oc";

const Header: Component = () => {
	return (
		<header class='flex w-full justify-center items-center bg-indigo-700 p-2 drop-shadow-lg flex-col'>
			<nav class='grid grid-cols-h-layout grid-rows-1 w-full h-3/4'>
				<div class='flex justify-center items-center'>
					<a href='/' class='flex justify-center items-center'>
						<img
							src={logo256}
							alt='CoffeeCo Logo'
							class='mr-8'
							height={52}
							width={52}
						/>
						<h1 class=' text-white text-lg font-medium'>CoffeeCo</h1>
					</a>
				</div>

				<div class='flex justify-center items-center'>
					<input
						name='Searchbar'
						class=' h-12 w-96 pl-4 rounded bg-slate-800 placeholder:text-slate-200 text-white focus:outline-none'
						type='text'
						placeholder='Search'
					/>
				</div>

				<div class='flex justify-center items-center'>
					<a
						class='text-white hover:text-slate-400 transition-colors mx-4'
						href='/users/1'
					>
						<OcPerson2 size={24} title='Profile' />
					</a>
					<a
						class='text-white hover:text-slate-400 transition-colors mx-4'
						href='/about'
					>
						<OcBook2 size={24} title='Profile' />
					</a>
					<button class='text-white transition-colors m-2 bg-indigo-800 p-2 rounded-lg hover:bg-indigo-700 hover:text-slate-400'>
						Log Out
					</button>
				</div>
			</nav>
		</header>
	);
};

export default Header;
