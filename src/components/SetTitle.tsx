import { Component, createEffect } from "solid-js";

interface TitleSetterProps {
	title: string;
}

const TitleSetter = (props: TitleSetterProps) => {
	createEffect(() => {
		document.title = props.title;
	});

	return null;
};

export default TitleSetter;
