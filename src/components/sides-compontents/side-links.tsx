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
    <li class='w-full border-b border-outline py-1 last:border-none'>
      <A
        class={`hover:bg-slate-950/25 active:bg-slate-950/35 flex flex-row items-center gap-1 py-1 pl-4 text-lg font-medium ${background} transition-colors`}
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
