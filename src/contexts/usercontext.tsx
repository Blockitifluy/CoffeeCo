import * as Solid from "solid-js";
import * as UserReq from "../requests/user";
import Cookies from "js-cookie";

/**
 * The User stored in a Context (Variable stored in an element)
 */
const User = Solid.createContext<UserReq.User | undefined>(UserReq.DefaultUser);

/**
 * Gets a User from Cookies' `AuthToken`
 * @returns The User
 */
async function GetUser(): Promise<UserReq.User> {
	try {
		const User = await UserReq.GetUserFromAuth();

		if (!User) {
			// refresh page
			Cookies.remove("AuthToken");

			console.error("Invalid Auth Token; Refreshing.");

			location.reload();
			return undefined as never;
		}

		return User;
	} catch (error) {
		console.error(error);
	}

	return UserReq.DefaultUser;
}

/**
 * The Resource (waiting to loaded to be a variable) of the User
 */
const UserResource = Solid.createResource(GetUser);

export interface UserProviderProps {
	children: Solid.JSX.Element;
}

/**
 * Context provider for the current user
 */
export const UserProvider: Solid.Component<UserProviderProps> = props => {
	const [user] = UserResource;

	const Auth = UserReq.GetAuthToken(),
		isInDevelopment = import.meta.env.DEV;

	return !Auth || isInDevelopment ? (
		<User.Provider value={undefined}>{props.children}</User.Provider>
	) : (
		<Solid.Show when={user.state === "ready"}>
			<User.Provider value={user()}>{props.children}</User.Provider>
		</Solid.Show>
	);
};

/**
 * Gets the provided current user
 * @returns The user context
 */
export function useUser() {
	return Solid.useContext(User);
}
