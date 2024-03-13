import { Component, For, createContext, useContext } from "solid-js";
import { OcAlert2 } from "solid-icons/oc";
import { GetMessageForStatus } from "./GetMessageForStatus";

interface ErrorMessageProps {
	message?: string;
	code: number;
}

function MessageFromError(ErrorMessage: ErrorMessageProps): string {
	if (ErrorMessage.message) {
		const addedCode = ErrorMessage.code === 0 ? "" : `${ErrorMessage.code} - `;

		return addedCode + ErrorMessage.message;
	}

	return GetMessageForStatus(ErrorMessage.code);
}

export const ErrorMessage: Component<ErrorMessageProps> = (
	props: ErrorMessageProps
) => {
	const finalMessage: string = MessageFromError(props);

	return (
		<li class='bg-sandy-700 text-white w-full p-1 px-3 rounded-md flex justify-center items-center'>
			<OcAlert2 class='inline mr-3' />
			{finalMessage}
		</li>
	);
};

const ErrorUI: Component = () => {
	const useError = useContext(Errors);

	return (
		<ul
			id='error-list'
			class='fixed bottom-16 flex flex-col-reverse w-max left-1/2 translate-x-[-50%] gap-2'
		>
			<For each={useError}>
				{error => <ErrorMessage message={error.message} code={error.code} />}
			</For>
		</ul>
	);
};

// TODO
export const Errors = createContext<ErrorMessageProps[]>([]);

export default ErrorUI;
