import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { ChildrenProps } from '../../common';

export interface IslandLinkProps extends ChildrenProps {
  href: string;
  selected: boolean;
}

export const IslandLink: Component<IslandLinkProps> = (props) => {
  const background = () => (props.selected ? 'bg-slate-950/35' : '');

  return (
    <li class='w-full transition-opacity hover:opacity-60'>
      <A class={`${background()} island-link`} href={props.href}>
        {props.children}
      </A>
    </li>
  );
};

export interface IslandProps extends ChildrenProps {
  title: string;
}

const Island: Component<IslandProps> = (props) => {
  return (
    <div class='text-text'>
      <h1 class='mb-2 text-2xl font-medium text-title'>{props.title}</h1>

      {props.children}
    </div>
  );
};

export default Island;
