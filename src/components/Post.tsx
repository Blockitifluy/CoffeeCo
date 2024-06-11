import { OcComment2, OcThumbsdown2, OcThumbsup2 } from 'solid-icons/oc';
import { deformatImages, ImageObj, ValidImages } from '../requests/images';
import { DefaultUser, getUserFromID, User } from '../requests/user';
import { Show, Component, createResource, For } from 'solid-js';
import ProfileIcon from '../assets/DefaultProfile.png';
import { Post } from '../requests/post';
import { ChildrenProps } from '../common';
import { A } from '@solidjs/router';
import RichText from './rich-text';

/**
 * The propetries of {@link PostSkeleton}
 */
export interface PostSkeletonProps extends ChildrenProps {
  /**
   * A post's title, such as a username
   */
  title: string;
  /**
   * A subtitle for a post, such as a date
   */
  subtitle: string;
  /**
   * The URL clicked on the Profile Image
   */
  url?: string;
}

/**
 * A post's skeleton
 * @param props children, title and subtitle
 */
export const PostSkeleton: Component<PostSkeletonProps> = (props) => {
  const linkLabel = `${props.title}'s page`;

  return (
    <article class='post'>
      {props.url ? (
        <A href={props.url} aria-label={linkLabel}>
          <img
            src={ProfileIcon}
            alt={`${props.title} Profile Image`}
            width={32}
            height={32}
            class='rounded-full'
          />
        </A>
      ) : (
        <img
          src={ProfileIcon}
          width={32}
          height={32}
          class='rounded-full'
          alt={`${props.title} Profile Image`}
        />
      )}

      <div class='flex flex-col justify-center'>
        <h1 class='text-ms font-medium leading-4 text-title'>{props.title}</h1>
        <p class='text-xs text-subtitle'>{props.subtitle}</p>
      </div>

      {props.children}
    </article>
  );
};

/**
 * Propetries for a {@link PostButton}
 */
interface PostButtonProps extends ChildrenProps {
  /**
   * Button's text
   */
  text: string;
  /**ss
   * The button an `a` or a `button`
   */
  isButton: boolean;
  /**
   * A provided url for an `a`
   */
  url?: string;
}

/**
 * The Post's button displayed at the bottom of a post
 * @param props A button's text and url (and is a button)
 */
const PostButton: Component<PostButtonProps> = (props) => {
  return props.isButton ? (
    <button class='flex flex-row items-center gap-1 text-sm text-text'>
      {props.children}
      <span>{props.text}</span>
    </button>
  ) : (
    <A
      href={props.url || '/not-found'}
      class='flex flex-row items-center gap-1 text-sm text-text'
    >
      {props.children}
      <span>{props.text}</span>
    </A>
  );
};

/**
 * A loading post
 */
export const DummyPost: Component = () => {
  return (
    <PostSkeleton title='Waiting for Response' subtitle='loading'>
      <div class='col-start-2 w-full'>
        <p class='text-text'>loading</p>
      </div>
    </PostSkeleton>
  );
};

/**
 * Propetries for {@link PostImages}
 */
export interface PostImageProps {
  /**
   * A `image` list
   * @see ValidImages
   */
  images: string;
}

/**
 * A subcomponent of a {@link PostUI Post's} images
 * @param props an `images` string
 */
const PostImages: Component<PostImageProps> = (props) => {
  const ref: ImageObj[] = deformatImages(props.images);

  return (
    <section class='flex justify-center gap-2'>
      <For each={ref}>
        {(image) => (
          <img
            src={image.src}
            width={400 / ref.length}
            class='rounded-lg'
            alt={image.alt}
          />
        )}
      </For>
    </section>
  );
};

/**
 * Propetries for {@link PostUI}
 */
export interface PostProps {
  post: Post;
}

/**
 * Shows a {@link Post post} as a UI component
 * @param props A {@link Post} Object
 */
const PostUI: Component<PostProps> = (props) => {
  const pst = props.post;

  const [user] = createResource<User>(async () => {
    try {
      const usr = await getUserFromID(pst.postedBy);

      return usr;
    } catch (error) {
      console.error(error);

      return DefaultUser;
    }
  });

  const date = new Date(pst.timeCreated).toDateString();

  return (
    <Show when={!user.loading} fallback={<DummyPost />}>
      <PostSkeleton
        title={`@${user()!.handle}`}
        subtitle={date}
        url={`http://localhost:8000/user/${props.post.postedBy}`}
      >
        <div class='col-start-2 flex w-full flex-col gap-2 overflow-hidden'>
          <RichText class='whitespace-pre-wrap text-wrap break-words text-text'>
            {pst.content}
          </RichText>

          <Show when={ValidImages.test(pst.images)}>
            <PostImages images={pst.images} />
          </Show>

          <div class='flex-rows flex gap-3 text-lg'>
            <PostButton text='197' url={`/post/${pst.ID}`} isButton={false}>
              <OcComment2 />
            </PostButton>

            <PostButton text='200' isButton={true}>
              <OcThumbsup2 />
            </PostButton>

            <PostButton text='20' isButton={true}>
              <OcThumbsdown2 />
            </PostButton>
          </div>
        </div>
      </PostSkeleton>
    </Show>
  );
};

export default PostUI;
