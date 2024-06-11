import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { OcArrowleft2 } from 'solid-icons/oc';

/**
 * Happens when a URL isn't valid, so this page appears
 */
const NotFound: Component = () => {
  return (
    <>
      <Meta name='description' content='404 Not Found' />
      <Title>CoffeeCo - 404</Title>

      <div class='flex h-screen flex-col items-center justify-center gap-4'>
        <h1 class='text-center text-3xl font-semibold text-title'>
          404 - Not Found
        </h1>
        <p class='text-text'>Oops, looks like something went wrong</p>
        <div class='flex flex-col items-center gap-4'>
          <img
            src='https://images.unsplash.com/photo-1508935620299-047e0e35fbe3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            alt='Broken Plate'
            width={450}
          />

          <A
            href='/'
            class='flex flex-row items-center font-semibold text-accent'
          >
            <OcArrowleft2 aria-disabled />
            Go Back?
          </A>
        </div>
      </div>
    </>
  );
};

export default NotFound;
