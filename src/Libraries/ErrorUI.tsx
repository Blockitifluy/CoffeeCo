import {
	Component,
	For,
	createContext,
	useContext,
	Accessor,
	Setter,
	Context,
	onMount
} from "solid-js";
import { OcAlert2 } from "solid-icons/oc";
import { removeItemOnce as removeIndexFromList } from "./Utilities";

type Signal<t> = [Accessor<t>, Setter<t>];

export function useErrorList(): Signal<ErrorMessage[]> {
	if (Errors) return useContext(Errors);

	throw new Error("ErrorList not found");
}

export interface ErrorMessage {
	message?: string;
	code: number;
}

interface ErrorListItemProps extends ErrorMessage {
	index: number;
	Parent: Signal<ErrorMessage[]>;
}

export const ErrorListItem: Component<ErrorListItemProps> = (
	props: ErrorListItemProps
) => {
	onMount(() => {
		setTimeout(() => {
			const [errors, setError] = props.Parent;

			let Cloned = Object.assign([] as ErrorMessage[], errors());

			Cloned = removeIndexFromList(
				Cloned,
				Cloned.findIndex(v => Object.is(v, Cloned))
			);

			setError(Cloned);
		}, 5000); // In milliseconds (2 seconds)
	});

	return (
		<li class='bg-sandy-700 text-white w-full p-1 px-3 rounded-md flex justify-center items-center'>
			<OcAlert2 class='inline mr-3' />
			{props.message || props.code}
		</li>
	);
};

const ErrorList: Component = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [errors, setErrors] = useErrorList();

	return (
		<ul
			id='error-list'
			class='fixed bottom-16 flex flex-col-reverse w-max left-1/2 translate-x-[-50%] gap-2'
		>
			<For each={errors()}>
				{(error, i) => (
					<ErrorListItem
						message={error.message}
						code={error.code}
						index={i()}
						Parent={[errors, setErrors]}
					/>
				)}
			</For>
		</ul>
	);
};

// Man, I love contexts.
// This will be initated when app starts.
export const Errors: Context<Signal<ErrorMessage[]>> = createContext<
	Signal<ErrorMessage[]>
>() as never;

export default ErrorList;
