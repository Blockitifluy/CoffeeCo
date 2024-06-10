import PostList, { PostListHandler } from '../components/postlist';
import { Meta, Title } from '@solidjs/meta';
import Header from '../components/header';
import Sides from '../components/sides';
import { Component, createResource, For, Show } from 'solid-js';
import {
  getPostsFromQuery,
  Post,
  PostFeedList as postFeedList,
} from '../requests/post';
import PostUI from '../components/Post';
import { searchForUsers, User } from '../requests/user';

const LoadAmount = 10;

const handleScrollSearch: PostListHandler = async (get, set) => {
  console.log('Scrolled to the Bottom');
  if (get.loading) {
    return;
  }

  const content = new URLSearchParams(location.search).get('search');
  if (!content) {
    return;
  }

  set('loading', true);

  const NewComments = await getPostsFromQuery(
      content,
      get.times * LoadAmount,
      10,
    ),
    json: Post[] = await NewComments.json();

  if (!NewComments.ok) {
    console.error('Loading new posts was not ok');
    set('loading', false);
    return;
  }

  if (json.length < LoadAmount) {
    set('Posts', get.Posts.concat(...json));
    return; // Stop sending when response/future response will be empty
  }

  set('times', get.times + 1);
  set('Posts', get.Posts.concat(...json));
  set('loading', false);
};

/**
 * Gets the amount of posts wanted from every user
 * @param get The state of the {@link PostList}
 * @param set Can set the state of the {@link PostList}
 * @returns All posts from a global scope
 */
const handleScrollAll: PostListHandler = async (get, set) => {
  console.log('Scrolled To Bottom');
  if (get.loading) {
    return;
  }

  console.log('Loading New Posts');
  set('loading', true);

  try {
    const Res = await postFeedList(LoadAmount),
      Posts: Post[] = await Res.json();

    set('Posts', get.Posts.concat(...Posts));
  } catch (error) {
    console.error('Loading new posts was not ok');
  }

  set('times', get.times + 1);
  set('loading', false);
};

const UserListItem: Component<{ user: User }> = (props) => {
  const user = props.user;

  return (
    <a
      href={`/user/${user.ID}`}
      class='post grid'
      aria-label={`@${user.handle}`}
    >
      <img
        src={user.Profile}
        alt={`${user.username} Profile Image`}
        width={32}
        height={32}
        class='rounded-full'
      />

      <div class='flex flex-col justify-center'>
        <h1 class='text-ms font-medium leading-4 text-title'>
          {user.username}
        </h1>
        <p class='text-xs text-subtitle'>{user.handle}</p>
      </div>

      <p
        class={`col-start-2 overflow-ellipsis whitespace-pre-wrap text-wrap break-words text-base ${user.bio === '' ? 'text-subtitle' : 'text-text'}`}
      >
        {user.bio === '' ? 'No Bio' : user.bio}
      </p>
    </a>
  );
};

const UserList: Component<{ search: string }> = (props) => {
  const [users] = createResource<User[]>(async () => {
    try {
      const Res = await searchForUsers(props.search, 0, 5);
      return await Res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  return (
    <section class='flex flex-col items-center gap-4'>
      <Show when={!users.loading}>
        <For each={users()}>{(user) => <UserListItem user={user} />}</For>
      </Show>
    </section>
  );
};

/**
 * The main front page of website
 */
const MainPage: Component = () => {
  const search = new URLSearchParams(location.search).get('search');

  return (
    <>
      <Meta
        name='description'
        content='CoffeeCo is a place for Social Discussions, Art and Politics'
      />

      <Title>CoffeeCo</Title>

      <Header />

      <Sides>
        <main>
          <Show when={search}>
            <h1 class='ml-8 text-xl font-medium text-title'>
              Searching for "{search}"
            </h1>

            <UserList search={search!} />
          </Show>

          <PostList
            loadOffset={256}
            handler={search ? handleScrollSearch : handleScrollAll}
          >
            {(post) => <PostUI post={post} />}
          </PostList>
        </main>
      </Sides>
    </>
  );
};

export default MainPage;
