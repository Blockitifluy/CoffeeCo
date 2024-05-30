import { Component, JSX, Show, Setter, createSignal } from 'solid-js';
import { OcPlus2, OcBell2, OcThreebars2 } from 'solid-icons/oc';
import { A } from '@solidjs/router';
import Logo64 from '../assets/logos/logo64.png';
import { useUser } from '../contexts/usercontext';
import { isLoggedIn } from '../requests/user';
import { ChildrenProps } from '../common';
import Hamburger from './hamburger';

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

  return props.url ? (
    <A
      aria-label={props.label}
      class='btn-transition head-btn'
      href={props.url!}
    >
      {Content}
    </A>
  ) : (
    <button
      onClick={props.onClick}
      aria-label={props.label}
      class='btn-transition head-btn'
    >
      {Content}
    </button>
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

      <A href='/' class='full-center gap-4'>
        <img
          src={Logo64}
          loading='lazy'
          alt='CoffeeCo Logo'
          width='36'
          height='36'
        />
        <h1 class='hidden rounded px-1 text-lg font-semibold text-title transition-all hover:bg-accent/40 active:bg-accent/25 sm:block'>
          CoffeeCo
        </h1>
      </A>
    </section>
  );
};

const rightNotLoggedIn: Component = () => {
  return (
    <>
      <a class='btn-transition btn bg-button hover:bg-accent/75' href='/log-in'>
        Login
      </a>
      <span class='text-text'>or</span>
      <a
        class='btn-transition btn bg-button hover:bg-accent/75'
        href='/sign-up'
      >
        Signup
      </a>
    </>
  );
};

const Right: Component = () => {
  const User = useUser();

  return (
    <section class='flex flex-row-reverse items-center gap-6 px-4 md:gap-4'>
      <Show when={isLoggedIn()} fallback={rightNotLoggedIn({})}>
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

        <HeaderButton url='/new-post' label='Create Post' subtitle='Create'>
          <OcPlus2 />
        </HeaderButton>
      </Show>
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
        <div class='grid min-w-32 grid-cols-2'>
          <Left setHamburger={setHamburger} />

          <Right />
        </div>
      </header>

      <Hamburger toggle={hamburgerEnabled()} />
    </>
  );
};

export default Header;
