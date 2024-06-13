import { Component, JSX, Show, Setter, createSignal } from 'solid-js';
import { OcPlus2, OcBell2, OcThreebars2, OcSearch2 } from 'solid-icons/oc';
import { A } from '@solidjs/router';
import Logo from '../assets/logo.svg';
import { useUser } from '../contexts/user-context';
import { isLoggedIn } from '../requests/user';
import { ChildrenProps } from '../common';
import Hamburger from './hamburger';
import { useInput } from '../hooks';

// TODO Docs

interface HeaderLinksProps extends ChildrenProps {
  url?: string;
  subtitle?: string;
  label?: string;
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
}

const HeaderButton: Component<HeaderLinksProps> = (props) => {
  const Content = (
    <>
      <Show when={props.subtitle}>
        <p class='hidden text-sm text-text lg:block'>{props.subtitle}</p>
      </Show>
      {props.children}
    </>
  );

  return (
    <Show
      when={props.url}
      fallback={
        <button
          onClick={props.onClick}
          aria-label={props.label}
          class='btn-transition head-btn'
        >
          {Content}
        </button>
      }
    >
      <A
        aria-label={props.label}
        class='btn-transition head-btn'
        href={props.url!}
      >
        {Content}
      </A>
    </Show>
  );
};

const Left: Component<{ setHamburger: Setter<boolean> }> = (props) => {
  const setSwitch = () => {
    props.setHamburger((prev) => !prev);
  };

  return (
    <section class='flex flex-row items-center gap-4'>
      <div class='block lg:hidden'>
        <HeaderButton label='Hamburger Button' onClick={setSwitch}>
          <OcThreebars2 />
        </HeaderButton>
      </div>

      <A href='/' class='full-center gap-2'>
        <img
          src={Logo}
          class='scale-110'
          loading='lazy'
          alt='CoffeeCo Logo'
          width='36'
          height='36'
        />
        <h1 class='hidden rounded px-1 text-2xl font-bold text-title transition-all hover:bg-accent/40 active:bg-accent/25 sm:block'>
          CoffeeCo
        </h1>
      </A>
    </section>
  );
};

const RightNotLoggedIn: Component = () => {
  return (
    <>
      <a class='btn-transition head-btn' href='/log-in'>
        Login
      </a>
      <span class='text-text'>or</span>
      <a class='btn-transition head-btn' href='/sign-up'>
        Signup
      </a>
    </>
  );
};

const Right: Component = () => {
  const User = useUser();

  const searchTerm = new URLSearchParams(location.search).get('search');

  const [Connected, search] = useInput(searchTerm ?? '');

  const onSearchInput: JSX.EventHandlerUnion<
    HTMLInputElement,
    KeyboardEvent
  > = (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    console.log(`Searchbar: Searched for "${search()}"`);

    const SearchURL = new URL(location.href);
    if (search()) SearchURL.searchParams.delete('search');

    SearchURL.searchParams.set('search', search());

    location.href = SearchURL.toString();
  };

  return (
    <section class='flex flex-row-reverse items-center gap-6 px-4 md:gap-4'>
      <Show
        when={isLoggedIn()}
        fallback={
          <>
            <RightNotLoggedIn />
          </>
        }
      >
        <div
          aria-label='Profile'
          class='flex flex-row-reverse items-center gap-1'
        >
          <img
            src={User!.Profile}
            width={36}
            height={36}
            alt='Profile Image'
            class='rounded'
          />
        </div>

        <HeaderButton subtitle='' label='Notification'>
          <OcBell2 />
        </HeaderButton>

        <HeaderButton url='/add-post' label='Create Post' subtitle='Create'>
          <OcPlus2 />
        </HeaderButton>
      </Show>
      <div class='flex flex-row'>
        <OcSearch2 class='relative left-6 translate-y-1/2 text-white' />
        <input
          id='search'
          name='search'
          placeholder='Search'
          value={search()}
          onInput={Connected}
          onKeyPress={onSearchInput}
          class='full-center h-8 w-24 gap-2 text-ellipsis rounded bg-header p-2 pl-8 text-title outline outline-1 outline-outline transition-[width] placeholder:text-subtitle focus:w-48'
        />
      </div>
    </section>
  );
};

/**
 * Contains:
 * - Hamburger (Mobile only),
 * - CoffeeCo Logo,
 * - Searchbar,
 * - Post Creation,
 * - Notification,
 * - Profile
 * @returns The Header Component
 */
const Header: Component = () => {
  const [hamburgerEnabled, setHamburger] = createSignal<boolean>(false);

  return (
    <>
      <header class='text-slate-500 relative z-10 h-16 w-full bg-header px-4 py-4 outline outline-1 outline-outline'>
        <div class='mx-auto grid min-w-32 max-w-7xl grid-cols-2'>
          <Left setHamburger={setHamburger} />

          <Right />
        </div>
      </header>

      <Hamburger toggle={hamburgerEnabled()} />
    </>
  );
};

export default Header;
