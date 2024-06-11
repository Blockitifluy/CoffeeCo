import * as Solid from 'solid-js';
import * as UserReq from '../requests/user';
import Cookies from 'js-cookie';
import { ChildrenProps } from '../common';

/**
 * The User stored in a Context (Variable stored in an element)
 */
const User = Solid.createContext<UserReq.User | undefined>(undefined);

/**
 * Gets a User from Cookies' `AuthToken`
 * @returns The User
 */
async function GetUser(): Promise<UserReq.User | undefined> {
  try {
    const User = await UserReq.getUserFromAuth();

    if (!User) {
      // refresh page
      Cookies.remove('AuthToken');

      console.error('Invalid Auth Token; Refreshing.');

      location.reload();
      return undefined as never;
    }

    return User;
  } catch {
    /* empty */
  }

  return undefined;
}

/**
 * The Resource (waiting to loaded to be a variable) of the User
 */
const UserResource = Solid.createResource(GetUser);

/**
 * Context provider for the current user
 * @param props Only contains Children as a Propertry
 */
export const UserProvider: Solid.Component<ChildrenProps> = (props) => {
  const [user] = UserResource;

  const Auth = UserReq.getAuth(),
    isInDevelopment = import.meta.env.DEV;

  return !Auth || isInDevelopment ? (
    <User.Provider value={undefined}>{props.children}</User.Provider>
  ) : (
    <Solid.Show when={user.state === 'ready'}>
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
