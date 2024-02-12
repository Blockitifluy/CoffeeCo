# CoffeeCo

<!--Hero-->
<p align='center'>
  <img src="src/logo.png" alt='Logo Temo' height='350'/>
</p>

CoffeeCo is an up and coming social media app, using the Framework [SolidJS](https://www.solidjs.com/). Allowing for Better user personisation using CSS.

The project's stack is PyTS:

- [Python (Flask)](https://flask.palletsprojects.com/en/3.0.x/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Solidjs](https://www.solidjs.com/)

<!--Nerd Stuff-->

## Run the Project

This Project uses _Vite_ as required of SolidJS and uses Typescript.

### Development

To run the development server (Client Only), use the command in powershell:

```bash
npm run dev
```

Now, put in the url - [localhost:8000](localhost:8000).

## Basic Files / Directories

- [/src/routes/](./src/routes/): The directory of the Routes tsx pages,
- [/src/index.jsx](./src/index.jsx): The base jsx file (where the routes are computed),
- [/src/index.css](./src/index.css): The stylesheet (This project uses Tailwind so this is mostly unused),
- [/dist](./dist/): The compiled src file using _Vite_,
- [/api](./api/): The server side using Python Flask,
- [/tscontig.json](./tsconfig.json): The config for the typescript scripts

## Backend

The api for Coffeeco uses python (Using the _Flask_ framework) for it's rest pi. Since the project uses Solidjs and vite to compile the `src/` folder use:

```cmd
npm run build
```

All the compiled content will be found in `dist/` and `dist/assets/` directories.

### API Request

#### User

- `/api/user/getfromid/<int:id>`, _(GET)_ Gets the `username` and `id` from the user based the `id`
- `/api/user/add` _(POST)_, Add an user using `username` and `id`
- `/api/user/authtoid` _(GET)_ make the `auth` (from cookies) to `id`
- `/api/user/login` _(POST)_ Logins (Password needed) in user by using `LOGIN` cookie

#### Post

- `/api/post/postcontent`, _(POST)_ posts content under an account
