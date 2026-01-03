function displayError(message, traceback){
	const event = new CustomEvent("displayError", { detail: {
		message: message, traceback: traceback
	}})
	window.dispatchEvent(event)
}
eel.expose(displayError)
