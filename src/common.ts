import { JSX } from "solid-js";

export interface FetchError {
	public: string;
	message: string;
}

/**
 * A basic status with a `msg` and an `ok` boolean
 */
export class BasicStatus {
	/**
	 * The message displayed of the {@link BasicStatus}
	 */
	public msg: string;
	/**
	 * Dictates if the status is ok
	 */
	public ok: boolean;

	/**
	 * Constructs a {@link BasicStatus}
	 * @param msg The message of the {@link BasicStatus}
	 * @param ok If the status is ok
	 */
	constructor(msg: string, ok: boolean) {
		this.msg = msg;
		this.ok = ok;
	}
}

/**
 * A basic status with a `msg`, an `ok` boolean and can `show`
 * @extends BasicStatus
 */
export class Status extends BasicStatus {
	/**
	 * Dictates if the Status can be shown
	 */
	public show: boolean;

	/**
	 * Constructs a {@link Status}
	 * @param msg The message of the {@link BasicStatus}
	 * @param ok If the status is ok
	 * @param [show=true] Can the status be shown
	 */
	constructor(msg: string, ok: boolean, show: boolean = true) {
		super(msg, ok);
		this.show = show;
	}
}

/**
 * A component's propetries only containing a `Children` propetry
 */
export interface ChildrenProps {
	children: JSX.Element;
}

/**
 * Disables the `enter` key for `textarea` element
 * @param e Keyboard Event
 */
export const NoEnter: JSX.EventHandlerUnion<
	HTMLTextAreaElement,
	KeyboardEvent
> = e => {
	if (e.key !== "Enter") {
		return;
	}

	e.preventDefault();
};

export const DefaultStatus = new Status("", true, false),
	TOO_MANY_IMAGES = new Status("Too many Images", false),
	STATUS_SUCCESS = new Status("Success", true),
	FAILED_TO_LOAD_IMAGE = new Status("Couldn't Upload Image", false),
	NOTHING_ADDED = new Status("Nothing was Added", false);

export const FORM_NOT_FILLED = new BasicStatus("Form not Filled", false),
	STATUS_FAILED = new BasicStatus("Something went Wrong", false),
	LOGIN_FAILED = new BasicStatus("Something went wrong with Login", false),
	STATUS_NOT_CONNECTED = new BasicStatus("Not Connected", false),
	BASIC_STATUS_SUCCESS = new BasicStatus("Success", true),
	ADD_USER_ERROR = new BasicStatus(
		"Something went wrong with Creating User",
		false
	);
