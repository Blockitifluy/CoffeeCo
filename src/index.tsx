/* @refresh reload */

// This project uses Github Octicons (oc)
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { Link, MetaProvider } from '@solidjs/meta';

import { UserProvider } from './contexts/user-context';

import 'solid-devtools';
import './index.css';
import { ErrorBoundary, lazy } from 'solid-js';
import Boundary from './routes/error-boundary';

const MainPage = lazy(() => import('./routes/main-page')),
  NotFoundPage = lazy(() => import('./routes/not-found')),
  AddPostUI = lazy(() => import('./routes/add-post')),
  UserPage = lazy(() => import('./routes/user-page')),
  SignupPage = lazy(() => import('./routes/signup')),
  LoginPage = lazy(() => import('./routes/login')),
  PostFocusPage = lazy(() => import('./routes/post-focus'));

/**
 * Trys to get the root element, if doesn't exists then throws error
 * @throws Error (Root doesn't exist)
 * @returns Root Element
 */
function getRoot(): HTMLElement {
  const root = document.getElementById('root');

  // eslint-disable-next-line quotes
  if (!root) throw new Error("Root doesn't exist");

  if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
      'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
    );
  }

  return root;
}

/**
 * The routing element contains:
 * - `preconnects` and `dns-prefetch`,
 * - manifest.json,
 * - {@link Boundary ErrorBoundary},
 * - Web routing
 */
const RouteElement = () => {
  return (
    <MetaProvider>
      <UserProvider>
        <Link rel='dns-prefetch' href='https://fonts.googleapis.com' />
        <Link rel='preconnect' href='https://fonts.googleapis.com' />

        <Link rel='dns-prefetch' href='https://placehold.co' />
        <Link rel='preconnect' href='https://placehold.co' />

        <Link
          rel='manifest'
          href='/manifest.json'
          crossorigin='use-credentials'
        />
        <ErrorBoundary fallback={Boundary}>
          <Router explicitLinks={true}>
            <Route path='/post/:ID' component={PostFocusPage} />
            <Route path='/search/:ID' component={MainPage} />
            <Route path='/log-in' component={LoginPage} />
            <Route path='/sign-up' component={SignupPage} />
            <Route path='/user/:ID' component={UserPage} />
            <Route path='/add-post' component={AddPostUI} />
            <Route path='/' component={MainPage} />
            <Route path='*404' component={NotFoundPage} />
          </Router>
        </ErrorBoundary>
      </UserProvider>
    </MetaProvider>
  );
};

render(RouteElement, getRoot());
