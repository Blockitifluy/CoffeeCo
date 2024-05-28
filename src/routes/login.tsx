import { Component } from 'solid-js';
import Auth, { FormInput } from '../components/auth';
import { loginUser } from '../requests/user';
import { BasicStatuses, BasicStatus } from '../common';

const Submit: FormInput.AuthSubmit = async (Inputs) => {
  const handle: string | undefined = Inputs.get('Handle'),
    password: string | undefined = Inputs.get('Password');

  if (!handle || !password) return BasicStatuses.FORM_NOT_FILLED;

  try {
    await loginUser(handle, password);

    return BasicStatuses.BASIC_STATUS_SUCCESS;
  } catch (err) {
    console.error(err);

    return new BasicStatus((err as Error).message, false);
  }
};

const Inputs: FormInput.AuthInput[] = [
  new FormInput.AuthInput(
    'Handle',
    FormInput.AuthPlaceholder.username,
    false,
    24,
  ),
  new FormInput.AuthInput(
    'Password',
    FormInput.AuthPlaceholder.currentPassword,
    true,
  ),
];

const AuthPage: FormInput.AuthProps = {
  title: 'Login',
  subtitle: 'Stay updated on The World',
  confirmText: 'Log in',
  Inputs: Inputs,
  submit: Submit,
};

const LoginPage: Component = () => {
  return <Auth page={AuthPage} />;
};

export default LoginPage;
