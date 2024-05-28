import Header from '../components/Header';
import Sides from '../components/sides';
import {
  Component,
  createContext,
  Show,
  useContext,
  createResource,
  JSX,
} from 'solid-js';
import { DefaultUser, getUserFromID as getUserFromID } from '../requests/user';
import { useParams } from '@solidjs/router';
import PostList from '../components/postlist';
import { useUser } from '../contexts/usercontext';
import { OcGear2 } from 'solid-icons/oc';
import { Meta, Title } from '@solidjs/meta';

/**
 * The Page User (Stored in a Context)
 */
const PageUser = createContext(DefaultUser);

/**
 * The Propertries of {@link UserStats}
 */
interface UserStatsProps {
  /**
   * The name of the stat
   */
  key: string;
  /**
   * The value of the stat, could be a `number` and `string`
   */
  value: number | string;
}

/**
 * Displays a stat of a User
 * @param props The key and value propetries of the stat
 */
const UserStats: Component<UserStatsProps> = (props) => {
  return (
    <li>
      <span class='font-bold text-title'>{props.value}</span>
      <span class='ml-2 text-text'>{props.key}</span>
    </li>
  );
};

/**
 * The information of the User, including:
 * - Bio,
 * - Stat,
 * - Banner,
 * - Profile
 */
const UserInfo: Component = () => {
  const User = useContext(PageUser),
    SelfUser = useUser();

  return (
    <div class='flex w-full flex-col gap-2'>
      <div class='mx-auto w-96'>
        <h2 class='text-xl font-semibold text-title'>About Me</h2>

        <p class='mx-auto w-96 text-text'>{User.bio}</p>

        <Show when={Object.is(User, SelfUser)}>
          <button class='text-persian-700 my-2 flex size-fit items-center gap-1 text-title'>
            <OcGear2 class='mr-2 inline' />
            <span class='text-persian-700 font-semibold'>Settings</span>
          </button>
        </Show>
      </div>

      <ul class='mx-auto flex w-fit flex-row gap-4 rounded px-2 py-1'>
        <UserStats key='Followers' value={0} />
        <UserStats key='Following' value={0} />
        <UserStats key='Posts' value={0} />
      </ul>
    </div>
  );
};

/**
 * The User Page Component
 */
const UserPage: Component = () => {
  const User = useContext(PageUser);

  const ID: number = parseInt(useParams()['ID']);

  const BannerImage: JSX.CSSProperties = {
    'background-image': `url(${User.Banner})`,
  };

  return (
    <>
      <Meta name='author' content={`@${User.handle}`} />
      <Meta name='description' content={User.bio ?? 'No bio'} />

      <Title>{`CoffeeCo - @${User.handle}`}</Title>

      <Header />

      <div
        style={BannerImage}
        class='bg-persian-500 grid h-80 w-full grid-rows-2 justify-center rounded bg-cover bg-center bg-no-repeat py-2'
      >
        <section class='row-start-2 flex w-[36rem] flex-row items-center p-2'>
          <img
            src={User.Profile}
            alt={`User Profile for @${User.handle}`}
            class='rounded-full'
            height={100}
            width={100}
          />

          <div class='ml-4 grid grid-rows-2 gap-4'>
            <h1 class='text-2xl font-semibold'>{User.username}</h1>
            <sub class='text-md'>@{User.handle}</sub>
          </div>
        </section>
      </div>

      <Sides>
        <main class='flex flex-col items-center gap-8'>
          <UserInfo />

          <PostList amount={10} ID={ID} />
        </main>
      </Sides>
    </>
  );
};

/**
 * Wraps the {@link UserInfo} in a component wrapper
 */
const PageWrapper = () => {
  const DEBUG: boolean = import.meta.env.DEV;

  const ID: number = parseInt(useParams()['ID']);

  const [user] = createResource(() => {
    try {
      return getUserFromID(ID);
    } catch {
      return DefaultUser;
    }
  });

  return DEBUG ? (
    <PageUser.Provider value={user()!}>
      <UserPage />
    </PageUser.Provider>
  ) : (
    <Show when={user()}>
      <PageUser.Provider value={user()!}>
        <UserPage />
      </PageUser.Provider>
    </Show>
  );
};

export default PageWrapper;
