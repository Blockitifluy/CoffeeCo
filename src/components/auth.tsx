import {
  Component,
  createSignal,
  For,
  JSX,
  Setter,
  Show,
  Signal,
} from 'solid-js';
import { OcArrowleft2 } from 'solid-icons/oc';
import { Status, Statuses, BasicStatus } from '../common';
import { A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';

export namespace FormInput {
  export type InputMap = Map<string, string>;
  export type AuthSubmit = (Inputs: InputMap) => Promise<BasicStatus>;

  /**
   * Used by {@link AuthOnClick}
   */
  export interface AuthOnClickInputs {
    page: FormInput.AuthProps;
    /**
     * Sets the status
     */
    setStatus: Setter<Status>;
  }

  /**
   * The automatic fill of a input
   */
  export enum AuthPlaceholder {
    currentPassword = 'current-password',
    newPassword = 'new-password',
    username = 'username',
    email = 'email',
    name = 'name',
    off = 'off',
    on = 'on',
  }

  /**
   * The Propetries of {@link Auth}
   */
  export interface AuthProps {
    /**
     * The main title of Prompt
     */
    title: string;
    /**
     * Text under the title
     */
    subtitle: string;
    /**
     * The button's {@link FormInput.AuthProps.confirmText} text
     */
    confirmText: string;
    /**
     * The Input templetes
     */
    Inputs: FormInput.AuthInput[];
    /**
     * Happens on button click (On Submit)
     */
    submit: FormInput.AuthSubmit;
  }

  /**
   * An template of a {@link FormInput.AuthInput}
   */
  export interface AuthInput {
    /**
     * If false, the input is hidden (shown in •••)
     */
    isPassword: boolean;
    /**
     * The name of Input
     */
    key: string;
    /**
     * The placeholder Input
     */
    placeholder: AuthPlaceholder;
    /**
     * Maximum character limit for the input
     */
    limit?: number;
  }
}

/**
 * A map of input's name and value/data
 */
const InputMap: FormInput.InputMap = new Map<string, string>();

/**
 * Happens the input has a keyup event, then updates the signal and adds from {@link InputMap}
 * @param key The name of {@link InputUI Input}
 * @param Signal Contains getter (0) and setter (1)
 * @returns An event connecter
 */
function onInput(
  key: string,
  Signal: Signal<string>,
): JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> {
  return (event) => {
    const Target: HTMLInputElement = event.target as HTMLInputElement;

    Signal[1](Target.value);
    InputMap.set(key, Signal[0]());
  };
}

/**
 * The InputComponent included in {@link Auth}
 * @param props The InputComponent's propetries
 */
const InputUI: Component<FormInput.AuthInput> = (props) => {
  const [input, setInput] = createSignal<string>('');

  return (
    <input
      id={props.key}
      onKeyUp={onInput(props.key, [input, setInput])}
      class='rounded border-2 border-outline bg-background p-2 text-text placeholder:text-subtitle focus:outline-accent'
      placeholder={
        props.limit ? `${props.key} (${props.limit} limit)` : props.key
      }
      autocomplete={props.placeholder}
      maxlength={props.limit}
      type={props.isPassword ? 'password' : 'text'}
    />
  );
};

/**
 * When the submit button is clicked
 * @param inputs Includes the {@link InputUI.AuthOnClickInputs.page page} and sets the status
 * @param event The event occured on Mouse Click
 */
const AuthOnClick = async (
  inputs: FormInput.AuthOnClickInputs,
  event: MouseEvent,
) => {
  event.preventDefault();

  const result = await inputs.page.submit(InputMap),
    resultStatus = new Status(result.msg, result.ok);

  inputs.setStatus(resultStatus);

  console.log(result);

  if (result.ok) {
    location.href = '/';
  }
};

/**
 * The Auth Page (could be Login / Signin)
 * @param props The page's propetries
 */
const Auth: Component<{ page: FormInput.AuthProps }> = (props) => {
  const [status, setStatus] = createSignal<Status>(Statuses.DefaultStatus);

  return (
    <>
      <Meta name='description' content={props.page.subtitle} />
      <Title>CoffeeCo - {props.page.title}</Title>

      <div class='grid h-screen w-screen items-center justify-center bg-background'>
        <form class='flex w-80 flex-col gap-4 rounded bg-header px-8 py-10 drop-shadow-lg'>
          <h1 class='mt-2 text-3xl font-semibold leading-4 text-title'>
            {props.page.title}
          </h1>
          <sub class='mb-2 text-sm text-subtitle'>{props.page.subtitle}</sub>

          <Show when={status().show}>
            <span
              class={`${status().ok ? 'text-accent' : 'text-warning'} my-0 font-semibold`}
            >
              {status().msg}
            </span>
          </Show>

          <section class='mx-auto mb-2 flex w-64 flex-col gap-2'>
            <For each={props.page.Inputs}>
              {(input) => (
                <InputUI
                  isPassword={input.isPassword}
                  key={input.key}
                  placeholder={input.placeholder}
                />
              )}
            </For>
          </section>

          <section>
            <button
              onClick={[AuthOnClick as any, { page: props.page, setStatus }]}
              class='mx-auto w-full rounded bg-accent py-2 text-2xl font-medium text-white transition-colors hover:bg-accent/25'
            >
              {props.page.confirmText}
            </button>

            <A class='mt-4 flex items-center justify-end text-accent' href='/'>
              <OcArrowleft2 />
              Back
            </A>
          </section>
        </form>
      </div>
    </>
  );
};

export default Auth;
