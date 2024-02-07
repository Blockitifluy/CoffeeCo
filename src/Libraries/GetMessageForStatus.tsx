export function GetMessageForStatus(status: number): string {
	let result: string = "";

	switch (status) {
		case 500:
			result = "500 - Server Error";
			break;
		case 404:
			result = "404 - Not Found";
			break;
		case 400:
			result = "400 - Bad Request";
			break;
		case 401:
			result = "401 - Request isn't unauthorised"; //! ITS SPELT "UNAUTHORISED" NOT "UNAUTHORIZZZZZZZZED"
			break;
		case 201:
			result = "Everything is alright 👍";
			break;
		case 200:
			result = "Everything is alright 👍";
			break;
		default:
			result = `${status} - idk what happened?`;
	}

	return result;
}
