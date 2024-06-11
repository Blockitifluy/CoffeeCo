import { Meta, Title } from '@solidjs/meta';
import { OcArrowleft2 } from 'solid-icons/oc';

/**
 * A error boundary catchs uncaught errors, and changing the page
 * @todo Finish the element
 * @param err The error caught by the Boundary
 * @param reset The function to reset the page
 */
const Boundary = (err: Error, reset: () => void) => {
  // TODO
  return (
    <>
      <Meta name='description' content='404 Not Found' />
      <Title>CoffeeCo - 404</Title>

      <div class='flex h-screen flex-col items-center justify-center gap-4'>
        <h1 class='text-center text-3xl font-semibold text-title'>
          Something Went Wrong
        </h1>
        <img
          src='https://images.unsplash.com/photo-1508935620299-047e0e35fbe3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          alt='Logo'
          width={450}
        />
        <div class='flex w-96 flex-col gap-4'>
          <details>
            <summary class='font-medium text-title'>Error Summary</summary>
            <span class='font-mono text-text'>{err.message}</span>
          </details>
          <button
            onClick={reset}
            class='flex flex-row items-center font-semibold text-accent'
          >
            <OcArrowleft2 aria-disabled />
            Go Back?
          </button>
        </div>
      </div>
    </>
  );
};

export default Boundary;
