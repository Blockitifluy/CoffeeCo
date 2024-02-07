import logo256 from "../assets/logos/logo256.png";
import { Component } from "solid-js";

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
					<img
						height={36}
						width={36}
						class='aspect-square rounded-full'
						alt='Profile Image'
						src='https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
					/>
					<span class='text-white mx-3'>Blockitifluy</span>
				</div>
			</nav>
		</header>
	);
};

export default Header;
