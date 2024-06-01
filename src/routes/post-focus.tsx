import {
  Component,
  createContext,
  createEffect,
  createResource,
  createSignal,
  For,
  JSX,
  onMount,
  Show,
  useContext,
} from 'solid-js';
import Header from '../components/Header';
import Sides from '../components/sides';
import PostUI, { PostProps } from '../components/Post';
import {
  addPost,
  AddPostRequest,
  DefaultPost,
  Post,
  getPostFromID,
  PostListReq,
  getCommentsFromPost,
} from '../requests/post';
import { useParams } from '@solidjs/router';
import {
  authToID,
  DefaultUser,
  getUserFromID,
  isLoggedIn,
  User,
} from '../requests/user';
import { Meta, Title } from '@solidjs/meta';
import { createStore } from 'solid-js/store';
import { createBottomListener, useInput } from '../hooks';
import { NoEnter, Status, Statuses } from '../common';
import { OcPaperairplane2 } from 'solid-icons/oc';
import TextareaAutosize from 'solid-textarea-autosize';

const Comment: Component<PostProps> = (props) => {
  const pst = props.post;

  const [user] = createResource(async () => {
    try {
      const user = await getUserFromID(pst.postedBy);

      return user;
    } catch {
      return DefaultUser;
    }
  });

  const date = new Date(pst.timeCreated).toDateString();

  return (
    <Show when={!user.loading}>
      <article class='grid w-post grid-cols-post grid-rows-post gap-2'>
        <img
          height={32}
          width={32}
          src={user()!.Profile}
          alt={`@${user()!.username}'s Profile Image`}
          class='rounded-full'
        />
        <div class='flex flex-col'>
          <h1 class='text-ms font-medium leading-4 text-title'>
            @{user()!.handle}
          </h1>
          <sub class='text-xs text-subtitle'>{date}</sub>
        </div>
        <p class='col-start-2 text-text'>{pst.content}</p>
      </article>
    </Show>
  );
};

const commentListLoad: number = 10;

const CommentList: Component = () => {
  const { post } = useFocus();
  const [initComments] = createResource<PostListReq>(async () => {
    try {
      const Posts = await getCommentsFromPost(post.ID, 0, commentListLoad);

      return { Posts: await Posts.json(), ok: Posts.ok };
    } catch (error) {
      return { Posts: [], ok: false };
    }
  });

  const [state, setState] = createStore({
    loading: false,
    repeated: 1,
    comments: [] as Post[],
  });

  const handleScroll = async () => {
    console.log('Scrolled to the Bottom');
    if (state.loading) {
      return;
    }
    setState('loading', true);

    const NewComments = await getCommentsFromPost(
      post.ID,
      state.repeated * commentListLoad,
      10,
    );

    const json: Post[] = await NewComments.json();

    if (!NewComments.ok) {
      console.error('Loading new posts was not ok');
      setState('loading', false);
      return;
    }

    if (json.length < commentListLoad) {
      setState('comments', state.comments.concat(...json));

      // Stop sending when response/future response will be empty
      return;
    }

    setState('repeated', state.repeated + 1);
    setState('loading', false);
    setState('comments', state.comments.concat(...json));
  };

  createBottomListener(handleScroll, 512);

  return (
    <div class='flex flex-col items-center gap-4'>
      <Show when={!initComments.loading}>
        <For each={initComments()!.Posts.concat(state.comments)}>
          {(item) => <Comment post={item} />}
        </For>
      </Show>
    </div>
  );
};

const AddComment: Component = () => {
  const { post, user } = useFocus();

  const [Connector, input] = useInput<HTMLTextAreaElement>('');

  const [status, setStatus] = createSignal<Status>(Statuses.DefaultStatus);

  let color = '';
  createEffect(() => {
    color = status().ok ? 'text-accent' : 'text-warning';
  });

  const OnSubmit: JSX.EventHandlerUnion<
    HTMLButtonElement,
    MouseEvent
  > = async () => {
    try {
      const userID = await authToID();
      const Req: AddPostRequest = {
        postedBy: userID,
        content: input(),
        parentID: post.ID,
        images: '',
      };

      const Res = await addPost(Req);

      setStatus({
        show: true,
        ok: Res.ok,
        msg: Res.ok ? 'Success' : 'Something Went Wrong',
      });

      if (Res.ok) location.reload();
    } catch (error) {
      console.error(error);
      setStatus({
        show: true,
        ok: false,
        msg: (error as Error).message,
      });
    }
  };

  return (
    <div class='col-start-2 my-2 flex flex-col gap-2'>
      <Show when={status().show}>
        <span class={`${color} my-0 font-semibold`}>{status().msg}</span>
      </Show>

      <TextareaAutosize
        id='post-content'
        class='overflow-hidden rounded-xl bg-header p-2 px-4 text-text outline outline-1 outline-outline transition-[height] placeholder:text-subtitle'
        placeholder={`Comment on ${user.username}'s post`}
        cols={50}
        minRows={1}
        maxRows={6}
        maxLength={240}
        oninput={Connector}
        onkeydown={NoEnter}
      />

      <div class='flex flex-row items-center gap-2'>
        <button
          onclick={OnSubmit}
          aria-label='Submit Comment'
          class='flex aspect-square w-fit flex-row items-center gap-1 rounded-full bg-accent p-2 text-title'
        >
          <OcPaperairplane2 />
        </button>
        <p class='text-text'>{input().length}/240</p>
      </div>
    </div>
  );
};

const Main: Component = () => {
  const { post, user } = useFocus();
  return (
    <main class='flex flex-col items-center gap-2 pb-4'>
      <Title>{`CoffeeCo - ${user.handle}'s Post`}</Title>
      <Meta name='author' content={`@${user.handle}`} />
      <Meta name='description' content={post.content} />
      <PostUI post={post} />

      <Show when={isLoggedIn() || import.meta.env.DEV}>
        <AddComment />
      </Show>

      <CommentList />
    </main>
  );
};

interface FocusContextType {
  user: User;
  post: Post;
}

/**
 * Get the Post and the user who uploaded it
 */
function useFocus(): FocusContextType {
  return useContext(FocusContext);
}

const FocusContext = createContext<FocusContextType>({
  user: DefaultUser,
  post: DefaultPost,
});

interface PostFocusState {
  loading: boolean;
  user: User;
  post: Post;
}

const PostFocus: Component = () => {
  const [state, setState] = createStore<PostFocusState>({
    loading: true,
    user: DefaultUser,
    post: DefaultPost,
  });

  onMount(async () => {
    const userID = parseInt(useParams().ID);
    try {
      const findPost = await getPostFromID(userID);

      setState('post', findPost);
    } catch (error) {
      console.error(error);
    }

    try {
      const user = await getUserFromID(state.post.postedBy);
      setState('user', user);
    } catch (error) {
      console.error(error);
    }
    setState('loading', false);
  });

  return (
    <FocusContext.Provider value={{ post: state.post, user: state.user }}>
      <Header />
      <Sides>
        <Show when={!state.loading || import.meta.env.DEV}>
          <Main />
        </Show>
      </Sides>
    </FocusContext.Provider>
  );
};

export default PostFocus;
