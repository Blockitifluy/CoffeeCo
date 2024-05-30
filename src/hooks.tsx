import {
  Accessor,
  createEffect,
  createSignal,
  JSX,
  onCleanup,
  onMount,
} from 'solid-js';

export type InputHook<T> = [
  JSX.EventHandlerUnion<T, InputEvent>,
  Accessor<string>,
];

/**
 * A hook, the gets an input of a `input`/`textarea` as a string
 * @param def The default input
 * @returns Event connecter and gets the input string
 */
export function useInput<T>(def?: string): InputHook<T> {
  const [getter, setter] = createSignal<string>(def || '');

  const Connecter: JSX.EventHandlerUnion<T, InputEvent> = (event) => {
    const value: string = (event.target as any).value;
    setter(value);
  };

  return [Connecter, getter];
}

/**
 * Runs function if scroll whell is at the bottom of the page
 * @param on The function being executed on bottom scroll
 * @param offset An negative option offset
 */
export function createBottomListener(on: () => void, offset: number = 0) {
  const checkScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight + offset >= documentHeight) {
      on();
    }
  };

  createEffect(() => {
    const onScroll = () => checkScroll();

    window.addEventListener('scroll', onScroll);

    onCleanup(() => {
      window.removeEventListener('scroll', onScroll);
    });
  });
}

export enum ScrollDirection {
  Up,
  Down,
}

export type ScrollDirectionHook = [Accessor<ScrollDirection>, Accessor<number>];

/**
 * Gets the scroll direction and position
 * @returns Contain both: Scroll Direction and Scroll Position
 */
export function useScrollDirection(): ScrollDirectionHook {
  const [scrollY, setScrollY] = createSignal<number>(window.scrollY);
  const [scrollDirection, setScrollDirection] = createSignal<ScrollDirection>(
    ScrollDirection.Up,
  );

  const handleScroll = () => {
    const current = window.scrollY;
    if (current < scrollY()) {
      setScrollDirection(ScrollDirection.Up);
    } else if (current > scrollY()) {
      setScrollDirection(ScrollDirection.Down);
    }
    setScrollY(current);
  };

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    onCleanup(() => {
      window.removeEventListener('scroll', handleScroll);
    });
  });

  return [scrollDirection, scrollY];
}
