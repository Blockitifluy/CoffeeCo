import { Component, createMemo, For } from 'solid-js';
import { A } from '@solidjs/router';
import getLeftLink from '../../sideurls';
import { ChildrenProps } from '../../common';
import Island from './island';

interface LeftLinkProps extends ChildrenProps {
  text: string;
  url: string;
  selected: boolean;
}

const LeftLink: Component<LeftLinkProps> = (props) => {
  const background = createMemo(() => (props.selected ? 'bg-header' : ''));
  return (
    <li class='border-outline py-1 border-b last:border-none w-full'>
      <A
        class={`flex flex-row items-center text-lg gap-1 font-medium text-charcoal-600 hover:bg-slate-950/25 active:bg-slate-950/35 pl-4 py-1 ${background} transition-colors`}
        href={props.url}
      >
        {props.children}
        <span>{props.text}</span>
      </A>
    </li>
  );
};

const SideLinks: Component = () => {
  return (
    <Island title='Menu'>
      <ul class='flex flex-col items-start'>
        <For each={getLeftLink()}>
          {(link) => (
            <LeftLink
              url={link.url}
              text={link.text}
              selected={link.url === location.href}
            >
              {link.children}
            </LeftLink>
          )}
        </For>
      </ul>
    </Island>
  );
};

export default SideLinks;
