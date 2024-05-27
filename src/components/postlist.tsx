import { Component, For, Show, createResource } from 'solid-js';
import {
  GetPostsFromUser as getPostsFromUser,
  Post,
  PostFeedList as postFeedList,
} from '../requests/post';
import PostUI from './Post';

/**
 * Used by {@link getPostsGlobal}
 */
interface PostListReq {
  /** The posts response */
  Posts: Post[];
  /**Is request successful? */
  ok: boolean;
}

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
    <div class='flex flex-col justify-center items-center gap-2'>
      <h1 class='mb-4 font-bold text-9xl text-accent select-none'>404</h1>
      <h1 class='font-semibold text-3xl text-center select-none'>Not Found</h1>
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
 * Displayes the amount of Posts as requested
 * @param props The amount of the PostList
 */
const PostList: Component<PostListProps> = (props) => {
  const [posts] = createResource<PostListReq>(() => {
    if (props.ID) {
      return getPostUser(props.amount, props.ID);
    }

    return getPostsGlobal(props.amount);
  });

  return (
    <div class='flex flex-col items-center gap-4'>
      <Show when={!posts.loading || posts()?.ok}>
        <For each={posts()?.Posts} fallback={<ListFallback />}>
          {(post) => <PostUI post={post} />}
        </For>
      </Show>
    </div>
  );
};

export default PostList;
