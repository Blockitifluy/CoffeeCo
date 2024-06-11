import { NoEnter, Status, Statuses } from '../common';
import { Accessor, Component, For, Show } from 'solid-js';

import { addPost as addPost, AddPostRequest } from '../requests/post';
import { PostSkeleton } from '../components/Post';
import { useUser } from '../contexts/usercontext';
import { OcImage2, OcPaperairplane2, OcX2 } from 'solid-icons/oc';
import { uploadImage, reformatImages, ImageObj } from '../requests/images';
import Header from '../components/header';
import Sides from '../components/sides';
import { useInput } from '../hooks';
import { Meta, Title } from '@solidjs/meta';
import { createStore, SetStoreFunction } from 'solid-js/store';

/**
 * Propetries for {@link AddImageButton}
 */
interface AddImageProps {
  OnFileAdd: (Params: FileAddParams, event: Event) => Promise<void> | void;
  Params: FileAddParams;
}

/**
 * Used by {@link AddImageProps} and {@link OnFileAdd}.
 * Gets, sets images and set status.
 */
interface FileAddParams {
  state: PromptState;
  setState: SetStoreFunction<PromptState>;
}

/**
 * A button to select an image
 * @param props OnFileAdd and get/set images and set status
 */
const AddImageButton: Component<AddImageProps> = (props) => {
  return (
    <>
      <label
        for='image-picker'
        class='btn flex w-fit cursor-pointer flex-row items-center gap-2 bg-button text-text'
      >
        <OcImage2 />
        Add Images
      </label>
      <input
        type='file'
        id='image-picker'
        class='absolute -z-10 opacity-0'
        onInput={[props.OnFileAdd, props.Params as any]}
        accept='image/png, image/jpeg, image/gif'
        multiple
      />
    </>
  );
};

/**
 * Inputs need to {@link OnSubmit submit} a post.
 */
interface SubmitInputs {
  /*The content of the post*/
  input: Accessor<string>;
  /**
   * Gets the status and images
   */
  state: PromptState;
  /**
   * Sets the status and images
   */
  setState: SetStoreFunction<PromptState>;
}

/**
 * Submits a new post to the Database (Can fail)
 * @param inputs content, images and setting status
 * @param event The mouse event
 */
const OnSubmit = async (inputs: SubmitInputs, event: MouseEvent) => {
  event.preventDefault();

  try {
    const userID = useUser()?.ID;
    if (!userID) throw new Error('UserID doesn not exist');

    const Req: AddPostRequest = {
      content: inputs.input(),
      images: reformatImages(inputs.state.Images),
      postedBy: userID,
      parentID: -1, // Sole Post
    };

    const Res = await addPost(Req);

    inputs.setState('status', {
      show: true,
      ok: Res.ok,
      msg: Res.ok ? 'Success' : 'Something Went Wrong',
    });

    if (Res.ok) location.href = '/';
  } catch (err) {
    console.error(err);

    inputs.setState('status', {
      show: true,
      ok: false,
      msg: (err as Error).message,
    });
  }
};

/**
 * Used by {@link OnFileAdd}
 *

/**
 * Adds a new Image to new post
 * @param Params needs to get and set images, and set status
 * @param event The event occured
 */
async function OnFileAdd(Params: FileAddParams, event: Event) {
  const Target: HTMLInputElement = event.target as HTMLInputElement;

  const Files = Target.files;
  if (!Files) {
    Params.setState('status', Statuses.NOTHING_ADDED);
    return;
  }

  if (Files.length + Params.state.Images.length > 4) {
    Params.setState('status', Statuses.TOO_MANY_IMAGES);
    return;
  }

  let index = 0;
  do {
    const img = Files.item(index);
    if (!img) continue;

    const imgBlob = img.slice(0, img.size, img.type);

    try {
      const fileName = await uploadImage(imgBlob);

      const imageData: ImageObj = {
        src: `http://localhost:8000/api/images/download/${encodeURIComponent(fileName)}`,
        alt: 'TODO', // TODO
      };

      Params.setState('Images', (prev) => [...prev, imageData]);
    } catch {
      Params.setState('status', Statuses.FAILED_TO_LOAD_IMAGE);
      return;
    }
    index++;
  } while (index < Files.length);

  Params.setState('status', Statuses.STATUS_SUCCESS);
}

// UI

module ImagePreview {
  /**
   * The props for {@link ImagePreview}:
   * - image,
   * - index,
   * - setImages
   */
  export interface Props {
    /**
     * The image for the preview
     */
    state: PromptState;
    /**
     * The index for the preview element
     */
    index: number;
    /**
     * Sets the image from {@link AddPostUI}
     */
    setState: SetStoreFunction<PromptState>;
  }

  /**
   * Closes a {@link ImagePreview}
   * @param Params the {@link ImagePreview.Props Propetries} of {@link ImagePreview}
   */
  export const Close = (Params: Props) => {
    Params.setState('Images', (prev) => {
      const clone = [...prev];
      clone.splice(Params.index, 1);
      return clone;
    });
  };

  /**
   * A preview of the uploaded image from {@link AddPostUI}, and is able to be deleted
   * @param props {@link ImagePreview.Props Propetries}
   */
  export const Preview: Component<Props> = (props) => {
    const image = props.state.Images[props.index];

    return (
      <li class='grid grid-rows-[0px_1fr]'>
        <button
          class='bg-sandy-500 relative size-6 rounded leading-none text-warning'
          onClick={[ImagePreview.Close, props]}
        >
          <OcX2 class='m-auto text-lg' />
        </button>
        <img
          src={image.src}
          alt={image.alt}
          class='rounded'
          width={100}
          height={100}
        />
      </li>
    );
  };
}

interface PromptState {
  Images: ImageObj[];
  status: Status;
}

/**
 * The component upload:
 * - content,
 * - images
 */
const Prompt: Component = () => {
  const [Connecter, getInput] = useInput<HTMLTextAreaElement>();

  const User = useUser();
  if (!User) throw new Error('UserID doesn not exist');

  const [state, setState] = createStore<PromptState>({
    Images: [],
    status: Statuses.DefaultStatus,
  });

  const colorStatus = () => (state.status.ok ? 'text-accent' : 'text-warning');

  return (
    <PostSkeleton title='Create New Post' subtitle={`As @${User!.handle}`}>
      <div class='col-start-2 flex flex-col gap-1'>
        <Show when={state.status.show}>
          <span class={`${colorStatus()} my-0 font-semibold`}>
            {state.status.msg}
          </span>
        </Show>

        <div class='grid grid-cols-[1fr_0px]'>
          <textarea
            id='post-content'
            class='bg-header text-text outline outline-1 outline-outline placeholder:text-subtitle'
            placeholder='Express Yourself'
            cols={50}
            rows={6}
            maxLength={240}
            oninput={Connecter}
            onkeydown={NoEnter}
          />
          <p class='relative right-16 top-full -translate-y-8 text-title/50'>
            {getInput().length}/240
          </p>
        </div>

        <section class='my-2 flex flex-col gap-2'>
          <AddImageButton OnFileAdd={OnFileAdd} Params={{ state, setState }} />

          <Show when={state.Images.length > 0}>
            <ul class='justify-left flex flex-row gap-3'>
              <For each={state.Images}>
                {(img, index) => {
                  return (
                    <ImagePreview.Preview
                      setState={setState}
                      index={index()}
                      state={state}
                    />
                  );
                }}
              </For>
            </ul>
          </Show>
        </section>

        <button
          class='btn button flex w-fit items-center gap-2 bg-accent'
          type='submit'
          onClick={[
            OnSubmit,
            { input: getInput, state: state, setState: setState },
          ]}
        >
          <OcPaperairplane2 />
          Submit
        </button>
      </div>
    </PostSkeleton>
  );
};

/**
 * Basic Sides Page
 */
const AddPostUI: Component = () => {
  const User = useUser();
  if (!User) throw new Error('UserID doesn not exist');

  return (
    <>
      <Title>CoffeeCo - New Post</Title>

      <Meta
        name='description'
        content='CoffeeCo is a place for Social Discussions, Art and Politics'
      />

      <Header />

      <Sides>
        <main class='mx-auto'>
          <Prompt />
        </main>
      </Sides>
    </>
  );
};

export default AddPostUI;
