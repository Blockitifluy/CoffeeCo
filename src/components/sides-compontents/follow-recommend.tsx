import { Component } from 'solid-js';
import Island, { IslandLink } from './island';
import { DefaultUser } from '../../requests/user';
import { OcPeople2 } from 'solid-icons/oc';

const FollowItem: Component = () => {
  return (
    <IslandLink href='' selected={false}>
      <div class='transition-opacity hover:opacity-60'>
        <div class='flex items-center gap-1'>
          <img
            src={DefaultUser.Profile}
            alt={`@${DefaultUser.handle}'s Profile`}
            class='rounded-full'
            width={32}
            height={32}
          />
          <h2 class='text-base text-title'>@blockitifluy</h2>
        </div>
        <p class='text-sm text-text'>Bio Here Please Read Me</p>
        <OcPeople2 class='mr-1 inline' />
        <span class='inline text-sm'>9 Followers</span>
      </div>
    </IslandLink>
  );
};

const FollowRecommend: Component = () => {
  return (
    <Island title='Intresting People'>
      <ul class='flex flex-col gap-2'>
        <FollowItem />
        <FollowItem />
        <FollowItem />
        <FollowItem />
        <FollowItem />
      </ul>
    </Island>
  );
};

export default FollowRecommend;
