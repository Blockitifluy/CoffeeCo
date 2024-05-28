import { Component } from 'solid-js';
import { OcHash2 } from 'solid-icons/oc';
import Island, { IslandLink } from './island';

interface HashtagProps {
  text: string;
}

const Hashtag: Component<HashtagProps> = (props) => {
  const href = new URL(location.href);

  href.searchParams.set('h', encodeURIComponent(props.text));

  return (
    <IslandLink href={href.toString()} selected={false}>
      <OcHash2 class='text-text' />
      <span class='text-text'>{props.text}</span>
    </IslandLink>
  );
};

export const Popular: Component = () => {
  return (
    <Island title='Popular'>
      <select
        aria-label='Where?'
        name='Hastags'
        id='hashtags'
        class='appearance-none rounded bg-header px-2 text-text outline outline-1 outline-outline drop-shadow'
      >
        <option value='Worldwide'>Worldwide</option>
        <option value='Locally'>Locally</option>
      </select>

      <ul class='mt-2'>
        <Hashtag text='drake' />
        <Hashtag text='likethat' />
        <Hashtag text='science' />
        <Hashtag text='helloworld' />
        <Hashtag text='swifty' />
        <Hashtag text='taylorswift' />
      </ul>
    </Island>
  );
};

export default Popular;
