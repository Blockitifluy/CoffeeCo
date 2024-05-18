/**
 * Regex for Validating multiple images
 * @example "src1 (alt1),src2 (alt2)"
 */
export const ValidImages: RegExp = /(?:.+ \(.+?\),)*.+ \(.+?\)/,
	/**
	 * Regex for Validating a single image
	 * @example "src (alt)"
	 */
	ValidImage: RegExp = /(.+) \((.+?)\)/;

/**
 * Image object with:
 * - src,
 * - alt
 */
export interface ImageObj {
	/**
	 * The source url of the image
	 */
	src: string;
	/**
	 * The alternate text of the image
	 */
	alt: string;
}

/**
 * A {@link ImageObj} represented as a string used for RegExp
 */
// eslint-disable-next-line quotes
const ImageParse: string = '{"src": "$1", "alt": "$2"}';

/**
 * Turns a `images` string to {@link ImageObj ImageObjects}
 * @param images A images string (see {@link ValidImages})
 * @returns A list of {@link ImageObj ImageObject}
 */
export function DeformatImages(images: string): ImageObj[] {
	const total: ImageObj[] = [],
		split: string[] = images.split(",");

	for (let i = 0; i < split.length; i++) {
		const item: string = split[i];

		const replaced: string = item.replace(ValidImage, ImageParse),
			parsed: ImageObj = JSON.parse(replaced);

		total.push(parsed);
	}

	return total;
}

/**
 * Turns a list of {@link ImageObj ImageObjects} to `images` string
 * @param images  A list of {@link ImageObj ImageObject}
 * @returns A images string (see {@link ValidImages})
 */
export function ReformatImages(images: ImageObj[]): string {
	const total: string[] = [];

	for (let i = 0; i < images.length; i++) {
		const item = images[i];

		total[i] = `${item.src} (${item.alt})`;
	}

	return total.join(",");
}

/**
 * Uploads an image to the Database
 * @param img The image represented as a Blob
 * @returns The filename of the uploaded image
 */
export async function UploadImage(img: Blob): Promise<string> {
	const Res = await fetch("http://localhost:8000/api/images/upload", {
		body: img,
		headers: {
			"Content-Type": img.type
		},
		method: "POST"
	});

	if (!Res.ok) throw new Error("Uploading image was not ok");

	const json: { fileName: string } = await Res.json();

	return json.fileName;
}

/**
 * Downloads an image from the Database
 * @param name The filename of the image
 * @returns The blob of the image
 */
export async function DownloadImage(name: string): Promise<Blob> {
	const Res = await fetch(`http://localhost:8000/api/images/download/${name}`, {
		method: "GET"
	});

	return Res.blob();
}
