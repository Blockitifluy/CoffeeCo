import {
  Component,
  createContext,
  JSX,
  onMount,
  Show,
  useContext,
} from 'solid-js';
import Header from '../components/header';
import Sides from '../components/sides';
import PostUI from '../components/Post';
import {
  addPost,
  AddPostRequest,
  DefaultPost,
  Post,
  getPostFromID,
  getCommentsFromPost,
} from '../requests/post';
import { useParams } from '@solidjs/router';
import { DefaultUser, getUserFromID, isLoggedIn, User } from '../requests/user';
import { Meta, Title } from '@solidjs/meta';
import { createStore } from 'solid-js/store';
import { NoEnter, Status, Statuses } from '../common';
import { OcPaperairplane2 } from 'solid-icons/oc';
import TextareaAutosize from 'solid-textarea-autosize';
import PostList, { PostListHandler } from '../components/postlist';
import Comment from '../components/comment';
import { useUser } from '../contexts/usercontext';

const PostLoad: number = 10;

const AddComment: Component = () => {
  const { post, user } = useFocus();

  const [state, setState] = createStore({
    input: '',
    status: Statuses.DefaultStatus,
  });

  const statusColour = () => (state.status.ok ? 'text-accent' : 'text-warning');

  const OnSubmit: JSX.EventHandlerUnion<
    HTMLButtonElement,
    MouseEvent
  > = async () => {
    try {
      const userID = useUser()?.ID;
      if (!userID) throw new Error('UserID doesn not exist');

      const Req: AddPostRequest = {
        postedBy: userID,
        content: state.input,
        parentID: post.ID,
        images: '',
      };

      const Res = await addPost(Req),
        msg = Res.ok ? 'Success' : 'Something Went Wrong';

      setState('status', new Status(msg, Res.ok));

      if (Res.ok) location.reload();
    } catch (error) {
      console.error(error);
      setState('status', new Status((error as Error).message, false));
    }
  };

  return (
    <div class='col-start-2 my-2 flex flex-col gap-2'>
      <Show when={state.status.show}>
        <span class={`${statusColour()} my-0 font-semibold`}>
          {state.status.msg}
        </span>
      </Show>

      <TextareaAutosize
        id='post-content'
        class='overflow-hidden rounded-xl bg-header p-2 px-4 text-text outline outline-1 outline-outline transition-[height] placeholder:text-subtitle'
        placeholder={`Comment on ${user.username}'s post`}
        cols={50}
        minRows={1}
        maxRows={6}
        maxLength={240}
        onInput={(event) => setState('input', event.target.value)}
        value={state.input}
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
        <p class='text-text'>{state.input.length}/240</p>
      </div>
    </div>
  );
};

const Main: Component = () => {
  const { post, user } = useFocus();

  const handleScroll: PostListHandler = async (get, set) => {
    console.log('Scrolled to the Bottom');
    if (get.loading) {
      return;
    }

    set('loading', true);

    const NewComments = await getCommentsFromPost(
      post.ID,
      get.times * PostLoad,
      10,
    );

    const json: Post[] = await NewComments.json();

    if (!NewComments.ok) {
      console.error('Loading new posts was not ok');
      set('loading', false);
      return;
    }

    if (json.length < PostLoad) {
      set('Posts', get.Posts.concat(...json));
      return; // Stop sending when response/future response will be empty
    }

    set('Posts', get.Posts.concat(...json));
    set('times', get.times + 1);
    set('loading', false);
  };

  return (
    <main class='flex flex-col items-center gap-2 pb-4'>
      <Title>{`CoffeeCo - ${user.handle}'s Post`}</Title>
      <Meta name='author' content={`@${user.handle}`} />
      <Meta name='description' content={post.content} />
      <PostUI post={post} />

      <Show when={isLoggedIn() || import.meta.env.DEV}>
        <AddComment />
      </Show>

      <PostList handler={handleScroll} loadOffset={256}>
        {(post) => <Comment post={post} />}
      </PostList>
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
