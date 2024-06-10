import Header from '../components/header';
import Sides from '../components/sides';
import {
  Component,
  createContext,
  Show,
  useContext,
  createResource,
} from 'solid-js';
import { DefaultUser, getUserFromID } from '../requests/user';
import { useParams } from '@solidjs/router';
import { useUser } from '../contexts/usercontext';
import { OcGear2 } from 'solid-icons/oc';
import { Meta, Title } from '@solidjs/meta';
import { getUserPostHistory, Post } from '../requests/post';
import PostUI from '../components/Post';
import PostList, { PostListHandler } from '../components/postlist';

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

const UserStats: Component<UserStatsProps> = (props) => {
  return (
    <li>
      <span class='font-bold text-title'>{props.value}</span>
      <span class='ml-2 text-text'>{props.key}</span>
    </li>
  );
};

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

const postsLoad: number = 10;

const UserPage: Component = () => {
  const ID: number = parseInt(useParams()['ID']);

  const handleScroll: PostListHandler = async (get, set) => {
    console.log('Scrolled to the Bottom');
    if (get.loading) {
      return;
    }

    set('loading', true);

    const NewComments = await getUserPostHistory(ID, get.times * postsLoad, 10),
      json: Post[] = await NewComments.json();

    if (!NewComments.ok) {
      console.error('Loading new posts was not ok');
      set('loading', false);
      return;
    }

    if (json.length < postsLoad) {
      set('Posts', get.Posts.concat(...json));
      return; // Stop sending when response/future response will be empty
    }

    set('times', get.times + 1);
    set('Posts', get.Posts.concat(...json));
    set('loading', false);
  };

  const [user] = createResource(() => {
    try {
      return getUserFromID(ID);
    } catch {
      return DefaultUser;
    }
  });

  return (
    <Show when={!user.loading || import.meta.env.DEV}>
      <PageUser.Provider value={user()!}>
        <Meta name='author' content={`@${user()!.handle}`} />
        <Meta name='description' content={user()!.bio ?? 'No bio'} />

        <Title>{`CoffeeCo - @${user()!.handle}`}</Title>

        <Header />

        <div
          style={{
            'background-image': `url(${user()?.Banner})`,
          }}
          class='bg-persian-500 grid h-80 w-full grid-rows-2 justify-center rounded bg-cover bg-center bg-no-repeat py-2'
        >
          <section class='row-start-2 flex w-[36rem] flex-row items-center p-2'>
            <img
              src={user()!.Profile}
              alt={`User Profile for @${user()!.handle}`}
              class='rounded-full'
              height={100}
              width={100}
            />

            <div class='ml-4 grid grid-rows-2 gap-4'>
              <h1 class='text-2xl font-semibold text-white'>
                {user()!.username}
              </h1>
              <sub class='text-md text-white'>@{user()!.handle}</sub>
            </div>
          </section>
        </div>

        <Sides>
          <main class='flex flex-col items-center gap-8'>
            <UserInfo />

            <PostList loadOffset={256} handler={handleScroll}>
              {(post) => <PostUI post={post} />}
            </PostList>
          </main>
        </Sides>
      </PageUser.Provider>
    </Show>
  );
};

export default UserPage;
