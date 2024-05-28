import { Component, createResource, Show } from 'solid-js';
import Header from '../components/Header';
import Sides from '../components/sides';
import PostUI, { PostProps } from '../components/Post';
import { Post, PostGetFromID as postGetFromID } from '../requests/post';
import { useParams } from '@solidjs/router';
import { OcArrowswitch2, OcSearch2 } from 'solid-icons/oc';
import { DefaultUser, getUserFromID } from '../requests/user';
import { Meta, Title } from '@solidjs/meta';

// TODO

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
      <div class='grid w-post grid-cols-post grid-rows-post gap-2'>
        <img
          height={32}
          width={32}
          src={user()!.Profile}
          class='rounded-full'
        />
        <div class='flex flex-col'>
          <h1 class='text-charcoal-950 text-ms font-medium leading-4'>
            @{user()!.handle}
          </h1>
          <sub class='text-charcoal-900 text-xs'>{date}</sub>
        </div>
        <p class='text-charcoal-950 col-start-2'>{pst.content}</p>
      </div>
    </Show>
  );
};

const PostFocus: Component = () => {
  const ID: number = parseInt(useParams().ID);

  const DefaultPost: Post = {
    content: 'Hello World',
    parentID: 0,
    ID: -1,
    postedBy: 0,
    timeCreated: '',
    images: '',
  };

  const [pst] = createResource<Post>(async () => {
    try {
      const GetPost = await postGetFromID(ID);

      return await GetPost.json();
    } catch (error) {
      console.error(error);

      const Placeholder: Post = {
        ID: 1,
        postedBy: 1,
        content: '',
        timeCreated: '',
        parentID: -1,
        images: '',
      };

      return Placeholder;
    }
  });

  const [user] = createResource(async () => {
    try {
      const user = await getUserFromID(ID);

      return user;
    } catch {
      return DefaultUser;
    }
  });

  return (
    <>
      <Show when={!pst.loading}>
        <Meta name='description' content={pst()!.content} />
      </Show>
      <Show when={!user.loading}>
        <Meta name='author' content={`@${user()!.handle}`} />
        <Title>CoffeeCo - @{user()!.handle}</Title>
      </Show>

      <Header />

      <Sides>
        <main class='flex flex-col items-center'>
          <Show when={!pst.loading}>
            <PostUI post={pst()!} />
          </Show>

          <hr class='text-charcoal-900/25 mb-2 mt-4 w-post border' />

          <div class='flex w-post flex-col gap-2'>
            <div class='flex w-fit items-center'>
              <OcSearch2 class='text-charcoal-100 absolute translate-x-2' />
              <input
                aria-label='comment-search'
                class='bg-persian-800 text-charcoal-100 placeholder:text-charcoal-100 w-fit rounded py-1 pl-8 pr-2 focus:outline-none'
                placeholder='Search Comments'
              />
            </div>

            <div class='flex items-center gap-2'>
              <OcArrowswitch2 />
              <label for='sorted-by' class='text-charcoal-900 font-semibold'>
                Sort by:
              </label>
              <select
                id='sorted-by'
                class='bg-persian-700 text-charcoal-100 rounded px-2 py-1'
              >
                <option>Popular</option>
                <option>New</option>
                <option>Controversial</option>
              </select>
            </div>
          </div>

          <div class='mx-auto flex w-post flex-col gap-2 pt-4'>
            <Comment post={DefaultPost} />
            <Comment post={DefaultPost} />
            <Comment post={DefaultPost} />
            <Comment post={DefaultPost} />
          </div>
        </main>
      </Sides>
    </>
  );
};

export default PostFocus;
