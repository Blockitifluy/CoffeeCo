import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import Logo256 from '../assets/logos/logo256.png';
import { Meta, Title } from '@solidjs/meta';

/**
 * Happens when a URL isn't valid, so this page appears
 */
const NotFound: Component = () => {
  return (
    <>
      <Meta name='description' content='404 Not Found' />
      <Title>CoffeeCo - 404</Title>

      <div class='flex justify-center items-center h-screen'>
        <div class='flex flex-col items-center gap-4'>
          <img src={Logo256} alt='Logo' />
          <h1 class='font-semibold text-3xl text-center'>
            404 - Not Page Found
          </h1>
          <div class='flex flex-col items-center gap-2'>
            <p class='text-slate-400'>Oops, looks like something went wrong</p>
            <A href='/' class='font-semibold text-persian-500'>
              Try Again?
            </A>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
