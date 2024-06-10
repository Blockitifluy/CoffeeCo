import { Component, For, JSX, onMount } from 'solid-js';
import { Post } from '../requests/post';
import { createStore, SetStoreFunction } from 'solid-js/store';
import { createBottomListener } from '../hooks';

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

export type PostListHandler = (
  get: PostListState,
  set: SetStoreFunction<PostListState>,
) => void;

/**
 * The Properties of the {@link PostList} component
 * @property amount The amount of Posts in the PostList
 * @property ID The posts wanted from user (If any)
 */
interface PostListProps {
  handler: PostListHandler;
  children: (post: Post) => JSX.Element;
  loadOffset: number;
}

export interface PostListState {
  times: number;
  loading: boolean;
  Posts: Post[];
}

/**
 * Displayes the amount of Posts as requested
 * @param props The amount of the PostList
 */
const PostList: Component<PostListProps> = (props) => {
  const [state, setState] = createStore<PostListState>({
    times: 0,
    loading: false,
    Posts: [],
  });

  const HandlerWrapper = () => {
    props.handler(state, setState);
  };

  onMount(HandlerWrapper);

  createBottomListener(HandlerWrapper, props.loadOffset);

  return (
    <div class='flex flex-col items-center gap-4'>
      <For each={state.Posts} fallback={<ListFallback />}>
        {props.children}
      </For>
    </div>
  );
};

export default PostList;
