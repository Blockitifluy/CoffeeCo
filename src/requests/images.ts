import { FetchError } from '../common';

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
export function deformatImages(images: string): ImageObj[] {
  const total: ImageObj[] = [],
    split: string[] = images.split(',');

  let index = 0;
  while (index < split.length) {
    const item: string = split[index];

    const replaced: string = item.replace(ValidImage, ImageParse);

    total.push(JSON.parse(replaced));
    index++;
  }

  console.log(`DeformatImages: ${images}:`, total);

  return total;
}

/**
 * Turns a list of {@link ImageObj ImageObjects} to `images` string
 * @param images  A list of {@link ImageObj ImageObject}
 * @returns A images string (see {@link ValidImages})
 */
export function reformatImages(images: ImageObj[]): string {
  const total: string[] = [];

  let index = 0;
  while (index < images.length) {
    const item = images[index];

    total.push(`${item.src} (${item.alt})`);
    index++;
  }

  const join = total.join(',');

  console.log('ReformatImages:', total, `: ${join}`);
  return join;
}

/**
 * Uploads an image to the Database
 * @param img The image represented as a Blob
 * @returns The filename of the uploaded image
 */
export async function uploadImage(img: Blob): Promise<string> {
  const Res = await fetch('http://localhost:8000/api/images/upload', {
    body: img,
    headers: {
      'Content-Type': img.type,
    },
    method: 'POST',
  });

  if (!Res.ok) {
    const ResError: FetchError = await Res.json();

    console.error(ResError);

    throw new Error(ResError.public);
  }

  return Res.text();
}

/**
 * Downloads an image from the Database
 * @param name The filename of the image
 * @returns The blob of the image
 */
export async function downloadImage(name: string): Promise<Blob> {
  const Res = await fetch(`http://localhost:8000/api/images/download/${name}`, {
    method: 'GET',
  });

  if (!Res.ok) {
    const ResError: FetchError = await Res.json();

    console.error(ResError);

    throw new Error(ResError.public);
  }

  return Res.blob();
}
