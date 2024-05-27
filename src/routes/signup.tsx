import { Component } from 'solid-js';
import AuthComponent, { Input } from '../components/auth';
import { newUser, loginUser } from '../requests/user';
import { BasicStatus, BasicStatuses } from '../common';

const Submit: Input.AuthSubmit = async (Inputs) => {
  const handle = Inputs.get('Handle'),
    password = Inputs.get('Password'),
    email = Inputs.get('Email');

  if (!handle || !password || !email) return BasicStatuses.FORM_NOT_FILLED;

  try {
    const Res = await newUser(handle, password, email);

    if (!Res.ok) return BasicStatuses.ADD_USER_ERROR;

    await loginUser(handle, password);

    return BasicStatuses.BASIC_STATUS_SUCCESS;
  } catch (err) {
    return new BasicStatus((err as Error).message, false);
  }
};

const Inputs: Input.AuthInput[] = [
  new Input.AuthInput('Handle', Input.AuthPlaceholder.username, false, 24),
  new Input.AuthInput('Email', Input.AuthPlaceholder.email, false),
  new Input.AuthInput('Password', Input.AuthPlaceholder.newPassword, true),
];

const AuthPage: Input.AuthProps = {
  title: 'Signup',
  subtitle: 'Stay updated on The World',
  confirmText: 'Sign up',
  Inputs: Inputs,
  submit: Submit,
};

const SignupPage: Component = () => {
  return <AuthComponent page={AuthPage} />;
};

export default SignupPage;
