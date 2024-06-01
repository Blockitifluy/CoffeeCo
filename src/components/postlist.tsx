import { Component, For, Show, createResource } from 'solid-js';
import {
  GetPostsFromUser as getPostsFromUser,
  Post,
  PostFeedList as postFeedList,
  PostListReq,
} from '../requests/post';
import PostUI from './Post';
import { createStore } from 'solid-js/store';
import { createBottomListener } from '../hooks';

/**
 * Gets the amount of posts wanted from every user
 * @param amount The amount of posts wanted
 * @returns All posts from a global scope
 */
async function getPostsGlobal(amount: number): Promise<PostListReq> {
  try {
    const Res = await postFeedList(amount);

    return { Posts: await Res.json(), ok: Res.ok };
  } catch (error) {
    console.error('Failed to Connect to Server');

    return { Posts: [], ok: false };
  }
}

/**
 * Get the amount of posts wanted from one user
 * @param amount The amount of posts wanted
 * @param ID The ID of the wanted user
 * @returns All posts from an user
 */
async function getPostUser(amount: number, ID: number): Promise<PostListReq> {
  try {
    const Res = await getPostsFromUser(amount, ID);

    const JSON: Post[] = await Res.json();

    return { Posts: JSON, ok: Res.ok };
  } catch (error) {
    console.error(error);

    return { Posts: [], ok: false };
  }
}

/**
 * Appears when there is {@link PostList} has no posts
 */
const ListFallback: Component = () => {
  return (
    <div class='flex flex-col items-center justify-center gap-2'>
      <h1 class='mb-4 select-none text-9xl font-bold text-accent'>404</h1>
      <h1 class='select-none text-center text-3xl font-semibold text-white'>
        Not Found
      </h1>
    </div>
  );
};

/**
 * The Properties of the {@link PostList} component
 * @property amount The amount of Posts in the PostList
 * @property ID The posts wanted from user (If any)
 */
interface PostListProps {
  amount: number;
  ID?: number;
}

/**
 * Loads post from a user (If ID is present, else from every user)
 * @param amount The amount of posts wanted
 * @param ID The user's ID
 * @returns A promise of PostListReq
 */
function loadPosts(amount: number, ID?: number): Promise<PostListReq> {
  if (ID) {
    return getPostUser(amount, ID);
  }

  return getPostsGlobal(amount);
}

interface PostListState {
  isLoadingPost: boolean;
  newPosts: Post[];
}

/**
 * Displayes the amount of Posts as requested
 * @param props The amount of the PostList
 */
const PostList: Component<PostListProps> = (props) => {
  const [state, setState] = createStore<PostListState>({
    isLoadingPost: false,
    newPosts: [],
  });

  const [initPosts] = createResource<PostListReq>(() =>
    loadPosts(props.amount, props.ID),
  );

  const handleScroll = async () => {
    console.log('Scrolled To Bottom');
    if (state.isLoadingPost) {
      return;
    }

    setState('isLoadingPost', true);

    console.log('Loading new posts');

    const NewPosts = await loadPosts(props.amount, props.ID);
    if (!NewPosts.ok) {
      console.error('Loading new posts was not ok');
      setState('isLoadingPost', false);
      return;
    }

    setState('newPosts', state.newPosts.concat(...NewPosts.Posts));
    setState('isLoadingPost', false);
  };

  createBottomListener(handleScroll, 100);

  return (
    <div class='flex flex-col items-center gap-4'>
      <Show when={!initPosts.loading || initPosts()?.ok}>
        <For
          each={initPosts()?.Posts.concat(...state.newPosts)}
          fallback={<ListFallback />}
        >
          {(post) => <PostUI post={post} />}
        </For>
      </Show>
    </div>
  );
};

export default PostList;
