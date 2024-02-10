import logo256 from "../assets/logos/logo256.png";
import { Component } from "solid-js";
import { OcSearch2, OcPerson2, OcBell2 } from "solid-icons/oc";

const Header: Component = () => {
	return (
		<header class='grid grid-cols-2 grid-rows-1 flex-row justify-center items-center bg-persian box-border'>
			<section class='flex flex-row items-center py-4 pl-16'>
				<a href='/' class='pr-16 flex flex-row items-center'>
					<img src={logo256} alt='CoffeeCo Logo' width={48} class='mr-4' />
					<h1 class='font-semibold text-2xl text-white mr-4'>CoffeeCo</h1>
				</a>

				<a href='/users/1' class='mr-4'>
					<OcPerson2 size={24} class='text-persian-100' />
				</a>

				<button>
					<OcBell2 size={24} class='text-persian-100' />
				</button>
			</section>
			<section class='flex flex-row-reverse items-center py-4 pr-16'>
				<input
					placeholder='Search for Hot Topics'
					class='min-w-64 mr-4 h-10 rounded-lg pr-4 pl-12 w-fit text-ellipsis bg-persian-700 placeholder:text-slate-300 text-white focus:outline-none'
					type='text'
				/>
				<OcSearch2 class='relative left-8 text-slate-300' />
			</section>
		</header>
	);

	/*return (
		<>
			<header class='flex justify-center items-center bg-charcoal p-2 drop-shadow-lg flex-col w-full'>
				<nav class='grid grid-cols-h-layout grid-rows-1 w-full h-3/4'>
					<div class='flex h-full w-full justify-center items-center'>
						<a href='/' class='flex justify-center items-center'>
							<img
								src={logo256}
								alt='CoffeeCo Logo'
								class='mr-8'
								height={52}
								width={52}
							/>
							<h1 class=' text-white text-lg 	font-medium'>CoffeeCo</h1>
						</a>
					</div>

					<div class='flex justify-center items-center'>
						<input
							name='Searchbar'
							class=' h-12 w-96 pl-4 rounded bg-charcoal-800 text-white focus:outline-none placeholder:text-slate-400'
							type='text'
							placeholder='Search'
						/>
					</div>

					<div class='flex justify-center items-center'>
						<Show
							when={ratio() >= 1.1}
							fallback={
								<OcHamburger
									class='text-white text-2xl cursor-pointer'
									onClick={() => {
										console.log("Press");

										setOpened(!isOpen());
									}}
								/>
							}
						>
							<img
								height={36}
								width={36}
								class='aspect-square rounded-full'
								alt='Profile Image'
								src='https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
							/>
							<span class='text-white mx-3'>Blockitifluy</span>
						</Show>
					</div>
				</nav>
			</header>
			<HamburgerMenu opened={isOpen()} />
		</>
	);*/
};

export default Header;
