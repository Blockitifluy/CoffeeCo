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

Now, put in the url - [localhost:8000](localhost:8000) - of your browser of choice, and the website is working as expected. _To be noted, fetch request to the server can't be used_.

### Production

To build the client side use the command:

```bash
npm run build
```

To run the Python api server:

```bash
python ./api/server.py
```

or `py ./api/server.py`

Then finally, put the url: [localhost:8000](localhost:8000)

## Basic Files / Directories

- [/src/routes/](./src/routes/): The directory of the Routes tsx pages,
- [/src/index.jsx](./src/index.jsx): The base jsx file (where the routes are computed),
- [/src/index.css](./src/index.css): The stylesheet (This project uses Tailwind so this is mostly unused),
- [/dist](./dist/): The compiled src file using _Vite_,
- [/api](./api/): The server side using Python Flask,
- [/tscontig.json](./tsconfig.json): The config for the typescript scripts

## Backend

The api for Coffeeco uses (may use [Go](https://go.dev/) in the future) for it's rest pi. Since the project uses Solidjs and vite to compile the `src/` folder use:

```cmd
npm run build
```

All the compiled content will be found in `dist/` and `dist/assets/` directories.

### API Request

- `/api/user/getfromid/<int:id>`, _(GET)_ Gets the `username` and `id` from the user based the `id`
- `/api/user/add` _(POST)_, Add an user using `username` and `id`
- `/api/user/authtoid` _(GET)_ make the `auth` (from cookies) to `id`
- `/api/user/login` _(POST)_ Logins (Password needed) in user by using `LOGIN` cookie

### Routes

For more about Routes in Solidjs see [here](https://docs.solidjs.com/guides/how-to-guides/routing-in-solid/solid-router) (**Link maybe out dated**).

- `/` : Home route
- `/users/:id` (or in the Python Flask `users/<int:users>`) : The route containing the user pages
- `/about` : an about section (_we don't talk about the about section_)

As seen in [src/index.jsx](./src/index.jsx):

```jsx
const RouteElement = () => {
	return (
		<Router>
			<Route path='/' component={MainPage} />
			<Route path='/users/:id' component={Profile} />
			<Route path='/about' component={AboutUs} />
		</Router>
	);
};
```
