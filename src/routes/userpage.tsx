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
    <li class='text-charcoal-950'>
      <span class='font-bold text-text'>{props.value}</span>
      <span class='ml-2 text-subtitle'>{props.key}</span>
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
    <div class='flex flex-col gap-2 w-full'>
      <Show when={Object.is(User, SelfUser)}>
        <button class='flex items-center gap-1 text-persian-700 size-fit'>
          <OcGear2 class='inline mr-2' />
          <span class='font-semibold text-persian-700'>Settings</span>
        </button>
      </Show>

      <ul class='flex flex-row gap-4 bg-white mx-auto px-2 py-1 rounded w-fit'>
        <UserStats key='Followers' value={0} />
        <UserStats key='Following' value={0} />
        <UserStats key='Posts' value={0} />
      </ul>

      <h2 class='font-semibold text-charcoal-950 text-xl'>About Me</h2>

      <p class='text-charcoal-950'>{User.bio}</p>
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
        class='justify-center grid grid-rows-2 bg-persian-500 bg-cover bg-no-repeat bg-center py-2 rounded w-full h-80'
      >
        <section class='flex flex-row items-center row-start-2 p-2 w-[36rem]'>
          <img
            src={User.Profile}
            alt={`User Profile for @${User.handle}`}
            class='rounded-full'
            height={100}
            width={100}
          />

          <div class='gap-4 grid grid-rows-2 ml-4'>
            <h1 class='font-semibold text-2xl'>{User.username}</h1>
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
