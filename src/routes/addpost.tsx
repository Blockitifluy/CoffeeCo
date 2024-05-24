import * as Common from "../common";
import * as Solid from "solid-js";

import { AddPost, AddPostRequest } from "../requests/post";
import { PostSkeleton } from "../components/post";
import { useUser } from "../contexts/usercontext";
import { OcImage2, OcPaperairplane2, OcX2 } from "solid-icons/oc";
import { UploadImage, ReformatImages, ImageObj } from "../requests/images";
import { AuthToID } from "../requests/user";
import Header from "../components/header";
import Sides from "../components/sides";
import { useInput } from "../hooks";
import { Meta, Title } from "@solidjs/meta";

/**
 * Propetries for {@link AddImageButton}
 */
interface AddImageProps {
	OnFileAdd: (Params: FileAddParams, event: Event) => Promise<void> | void;
	Params: FileAddParams;
}

/**
 * Used by {@link AddImageProps} and {@link OnFileAdd}.
 * Gets, sets images and set status.
 */
interface FileAddParams {
	getImages: Solid.Accessor<ImageObj[]>;
	setImages: Solid.Setter<ImageObj[]>;

	setStatus: Solid.Setter<Common.Status>;
}

/**
 * A button to select an image
 */
const AddImageButton: Solid.Component<AddImageProps> = props => {
	return (
		<>
			<label
				for='image-picker'
				class='bg-slate-400/25 px-2 py-1 rounded w-fit font-semibold text-slate-500 cursor-pointer button'
			>
				<OcImage2 />
				Add Images
			</label>
			<input
				type='file'
				id='image-picker'
				class='z-[-1] absolute opacity-0'
				onInput={[props.OnFileAdd, props.Params as any]}
				accept='image/png, image/jpeg, image/gif'
				multiple
			/>
		</>
	);
};

/**
 * Inputs need to {@link OnSubmit submit} a post.
 */
interface SubmitInputs {
	/**
	 * The content of the post
	 */
	input: Solid.Accessor<string>;
	/**
	 * The images contained the post
	 */
	images: Solid.Accessor<ImageObj[]>;
	/**
	 * Set the status of page
	 */
	setStatus: Solid.Setter<Common.Status>;
}

/**
 * Submits a new post to the Database (Can fail)
 * @param inputs content, images and setting status
 * @param event The mouse event
 */
const OnSubmit = async (inputs: SubmitInputs, event: MouseEvent) => {
	event.preventDefault();

	try {
		const usr: number = await AuthToID();

		const Req: AddPostRequest = {
			content: inputs.input(),
			images: ReformatImages(inputs.images()),
			postedBy: usr,
			parentID: -1 // Sole Post
		};

		const Res = await AddPost(Req);

		inputs.setStatus({
			show: true,
			ok: Res.ok,
			msg: Res.ok ? "Success" : "Something Went Wrong"
		});

		if (Res.ok) location.href = "/";
	} catch (err) {
		console.error(err);

		inputs.setStatus({
			show: true,
			ok: false,
			msg: (err as Error).message
		});
	}
};

/**
 * Used by {@link OnFileAdd}
 *

/**
 * Adds a new Image to new post
 * @param Params needs to get and set images, and set status
 * @param event The event occured
 */
async function OnFileAdd(Params: FileAddParams, event: Event) {
	const Target: HTMLInputElement = event.target as HTMLInputElement;

	const Files = Target.files;
	if (!Files) {
		Params.setStatus(Common.NOTHING_ADDED);
		return;
	}

	if (Files.length + Params.getImages().length > 4) {
		Params.setStatus(Common.TOO_MANY_IMAGES);
		return;
	}

	for (let i = 0; i < Files.length; i++) {
		const img = Files.item(i);
		if (!img) continue;

		const imgBlob = img.slice(0, img.size, img.type);

		try {
			const fileName = await UploadImage(imgBlob);

			const imageData: ImageObj = {
				src: `http://localhost:8000/api/images/download/${encodeURIComponent(fileName)}`,
				alt: "TODO" // TODO
			};

			Params.setImages(prev => [...prev, imageData]);
		} catch {
			Params.setStatus(Common.FAILED_TO_LOAD_IMAGE);
			return;
		}
	}

	Params.setStatus(Common.STATUS_SUCCESS);
}

/**
 * The props for {@link ImagePreview}:
 * - image,
 * - index,
 * - setImages
 */
interface ImagePreviewProps {
	/**
	 * The image for the preview
	 */
	image: ImageObj;
	/**
	 * The index for the preview element
	 */
	index: number;
	/**
	 * Sets the image from {@link AddPostUI}
	 */
	setImages: Solid.Setter<ImageObj[]>;
}

/**
 * Closes a {@link ImagePreview}
 * @param Params the {@link ImagePreviewProps Propetries} of {@link ImagePreview}
 */
const PreviewClose = (Params: ImagePreviewProps) => {
	Params.setImages(prev => {
		const clone = [...prev];
		clone.splice(Params.index, 1);
		return clone;
	});
};

/**
 * A preview of the uploaded image from {@link AddPostUI}, and is able to be deleted
 * @param props {@link ImagePreviewProps}
 */
const ImagePreview: Solid.Component<ImagePreviewProps> = props => {
	return (
		<li class='grid grid-rows-[0px_1fr]'>
			<button
				class='relative right-2 bottom-1 bg-sandy-500 rounded text-white leading-none size-6'
				onClick={[PreviewClose, props]}
			>
				<OcX2 class='m-auto text-lg' />
			</button>
			<img
				src={props.image.src}
				alt={props.image.alt}
				class='rounded'
				width={100}
				height={100}
			/>
		</li>
	);
};

/**
 * The component upload:
 * - content,
 * - images
 */
const Prompt: Solid.Component = () => {
	const User = useUser();

	const [Connecter, getInput] = useInput<HTMLTextAreaElement>();
	const [getStatus, setStatus] = Solid.createSignal<Common.Status>(
		Common.DefaultStatus
	);
	const [getImages, setImages] = Solid.createSignal<ImageObj[]>([]);

	return (
		<PostSkeleton title='Create New Post' subtitle={`As @${User!.handle}`}>
			<div class='flex flex-col gap-1 col-start-2'>
				<Solid.Show when={getStatus().show}>
					<span
						class={
							getStatus().ok
								? "text-persian-500"
								: "text-sandy-500" + " font-semibold my-0"
						}
					>
						{getStatus().msg}
					</span>
				</Solid.Show>

				<div class='grid grid-cols-[1fr_0px]'>
					<textarea
						id='post-content'
						class='drop-shadow-lg'
						placeholder='Express Yourself'
						cols={50}
						rows={4}
						maxLength={100}
						onKeyUp={Connecter}
						onkeyup={Common.NoEnter}
					/>
					<p class='relative top-full right-16 text-slate-400/50 -translate-y-6'>
						{getInput().length}/100
					</p>
				</div>

				<section class='flex flex-col gap-2 my-2'>
					<Solid.Show when={getImages().length > 0}>
						<ul class='flex flex-row justify-left gap-3'>
							<Solid.For each={getImages()}>
								{(img, i) => {
									return (
										<ImagePreview
											setImages={setImages}
											index={i()}
											image={img}
										/>
									);
								}}
							</Solid.For>
						</ul>
					</Solid.Show>

					<AddImageButton
						OnFileAdd={OnFileAdd}
						Params={{
							getImages: getImages,
							setImages: setImages,
							setStatus: setStatus
						}}
					/>
				</section>

				<div class='flex flex-row items-center gap-4'>
					<button
						class='bg-persian-500 text-white button'
						type='submit'
						onClick={[
							OnSubmit as any,
							{ input: getInput, setStatus: setStatus, images: getImages }
						]}
					>
						<OcPaperairplane2 />
						Submit
					</button>
				</div>
			</div>
		</PostSkeleton>
	);
};

/**
 * Basic Sides Page
 */
const AddPostUI: Solid.Component = () => {
	return (
		<>
			<Title>CoffeeCo - New Post</Title>

			<Meta
				name='description'
				content='CoffeeCo is a place for Social Discussions, Art and Politics'
			/>

			<Header />

			<Sides>
				<main class='mx-auto'>
					<Prompt />
				</main>
			</Sides>
		</>
	);
};

export default AddPostUI;
