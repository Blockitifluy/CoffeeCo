import FollowRecommend from './sides-compontents/follow-recommend';
import SideLinks from './sides-compontents/side-links';
import Popular from './sides-compontents/popular';

import { isLoggedIn } from '../requests/user';
import { Component, Show } from 'solid-js';
import { ChildrenProps } from '../common';

/**
 * The Right side of the {@link Sides}s
 */
const RightSide: Component = () => {
  return (
    <section class='sticky top-2 flex flex-col self-start px-4'>
      <Popular />
      <hr class='border-1 my-4 border-outline' />
      <FollowRecommend />
    </section>
  );
};

/**
 * The sides component is used in almost all pages
 * @param props Only contains children
 */
const Sides: Component<ChildrenProps> = (props) => {
  return (
    <div class='ml-4 grid max-w-7xl grid-cols-miniheader justify-center pt-4 md:mx-auto lg:grid-cols-header'>
      <section class='sticky top-2 hidden flex-col self-start px-4 lg:flex'>
        <Show when={isLoggedIn()}>
          <SideLinks />
        </Show>
      </section>

      {props.children}

      <RightSide />
    </div>
  );
};

export default Sides;
