import { Component, For, Show } from 'solid-js';
import { ChildrenProps } from '../common';
import getLeftLink from '../sideurls';
import { A } from '@solidjs/router';

interface HamburgerItemProps extends ChildrenProps {
  text: string;
  url: string;
  selected: boolean;
}

const HamburgerItem: Component<HamburgerItemProps> = (props) => {
  const Content = (
    <A
      href={props.url}
      class='flex flex-row items-center gap-2 text-lg font-medium text-title'
    >
      {props.children}
      <span>{props.text}</span>
    </A>
  );
  return (
    <li class='border-b-[1px] border-outline border-b-outline px-4 py-2 last:border-none'>
      {Content}
    </li>
  );
};

interface HamburgerProps {
  toggle: boolean;
}

const Hamburger: Component<HamburgerProps> = (props) => {
  return (
    <Show when={props.toggle}>
      <ul class='absolute top-0 z-0 block h-full w-60 bg-header pt-20 drop-shadow-lg transition-opacity lg:hidden'>
        <For each={getLeftLink()}>
          {(item) => (
            <HamburgerItem
              text={item.text}
              url={item.url}
              selected={item.url === location.href}
            >
              {item.children}
            </HamburgerItem>
          )}
        </For>
      </ul>
    </Show>
  );
};

export default Hamburger;
