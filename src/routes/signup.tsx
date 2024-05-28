import { Component } from 'solid-js';
import Auth, { FormInput } from '../components/auth';
import { newUser, loginUser } from '../requests/user';
import { BasicStatus, BasicStatuses } from '../common';

const Submit: FormInput.AuthSubmit = async (Inputs) => {
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

const Inputs: FormInput.AuthInput[] = [
  new FormInput.AuthInput(
    'Handle',
    FormInput.AuthPlaceholder.username,
    false,
    24,
  ),
  new FormInput.AuthInput('Email', FormInput.AuthPlaceholder.email, false),
  new FormInput.AuthInput(
    'Password',
    FormInput.AuthPlaceholder.newPassword,
    true,
  ),
];

const AuthPage: FormInput.AuthProps = {
  title: 'Signup',
  subtitle: 'Stay updated on The World',
  confirmText: 'Sign up',
  Inputs: Inputs,
  submit: Submit,
};

const SignupPage: Component = () => {
  return <Auth page={AuthPage} />;
};

export default SignupPage;
