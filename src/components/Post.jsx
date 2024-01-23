import logo from "../logo.png";

function PostUI(props) {
	return (
		<div class='border-b-2 py-4 border-slate-500 text-white'>
			<div class='flex'>
				<img
					src={logo}
					alt=''
					class='h-6 w-6 aspect-square bg-indigo-600 mr-2 rounded-full'
				/>
				<h1 class='mb-4'>Username</h1>
			</div>
			<p>
				Lorem ipsum @dolor, sit amet consectetur adipisicing elit. Aliquam, ab!
				Voluptatem, tenetur beatae molestias hic quos ut, modi enim voluptates
				doloribus officiis dignissimos ad accusantium perspiciatis eligendi sunt
				atque. Dolores. <br /> #Hello World #Why
			</p>
		</div>
	);
}

export default PostUI;
