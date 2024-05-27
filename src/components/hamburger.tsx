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
  return (
    <li class='border-outline px-4 py-2 border-b-[1px] border-b-outline last:border-none'>
      <A
        href={props.url}
        class='flex flex-row items-center gap-2 font-medium text-lg text-title'
      >
        {props.children}
        <span>{props.text}</span>
      </A>
    </li>
  );
};

interface HamburgerProps {
  toggle: boolean;
}

const Hamburger: Component<HamburgerProps> = (props) => {
  // TODO: Transition
  return (
    <Show when={props.toggle}>
      <div class='block top-0 z-0 absolute lg:hidden bg-header drop-shadow-lg pt-20 w-60 h-full'>
        <ul>
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
      </div>
    </Show>
  );
};

export default Hamburger;
