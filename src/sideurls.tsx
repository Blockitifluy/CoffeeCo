import {
	OcHome2,
	OcBook2,
	OcPeople2,
	OcCommentdiscussion2,
	OcFlame2,
	OcDevices2
} from "solid-icons/oc";
import { JSX } from "solid-js";

/**
 * An item on {@link getLeftLink}
 */
export class BasicLeftLink {
	/**
	 * The text displayed in the link
	 */
	public text: string;
	/** The url for the `a` element */
	public url: string;
	/** Extra elements inside of the link element, such as Logos */
	public children: JSX.Element;

	/**
	 * Creates a new {@link BasicLeftLink}
	 * @param text The text displayed in the link
	 * @param url The url for the `a` element
	 * @param children Extra elements inside of the link element, such as Logos
	 */
	constructor(text: string, url: string, children: JSX.Element) {
		this.text = text;
		this.url = url;
		this.children = children;
	}
}

/**
 * Links listed on the side of most pages.
 * Listed on [sides component](./components/sides.tsx)
 */
function getLeftLink(): BasicLeftLink[] {
	return [
		new BasicLeftLink("Home", "/", <OcHome2 />),
		new BasicLeftLink("Latest News", "/news", <OcBook2 />),
		new BasicLeftLink("Followers", "/followers", <OcPeople2 />),
		new BasicLeftLink("Message", "/private-messages", <OcCommentdiscussion2 />),
		new BasicLeftLink("Popular", "/?t=popular", <OcFlame2 />),
		new BasicLeftLink("Watch", "/?t=video", <OcDevices2 />)
	];
}

export default getLeftLink;
