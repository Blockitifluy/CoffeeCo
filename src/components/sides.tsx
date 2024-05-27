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
    <section class='top-2 sticky flex flex-col px-4 self-start'>
      <Popular />
      <hr class='border-1 border-outline my-4' />
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
    <div class='justify-center grid grid-cols-miniheader lg:grid-cols-header md:mx-auto ml-4 pt-4 max-w-7xl'>
      <section class='top-2 sticky lg:flex flex-col hidden px-4 self-start'>
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
