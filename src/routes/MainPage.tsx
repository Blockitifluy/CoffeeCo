import PostList from '../components/postlist';
import { Meta, Title } from '@solidjs/meta';
import Header from '../components/Header';
import Sides from '../components/sides';
import { Component } from 'solid-js';

/**
 * The main front page of website
 */
const MainPage: Component = () => {
  return (
    <>
      <Meta
        name='description'
        content='CoffeeCo is a place for Social Discussions, Art and Politics'
      />

      <Title>CoffeeCo</Title>

      <Header />

      <Sides>
        <main>
          <PostList amount={10} />
        </main>
      </Sides>
    </>
  );
};

export default MainPage;
