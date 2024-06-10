import { Component, createResource, Show } from 'solid-js';
import { DefaultUser, getUserFromID } from '../requests/user';
import { PostProps } from './Post';

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

export default Comment;
