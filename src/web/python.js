function displayError(message, traceback){
	const event = new CustomEvent("displayError", { detail: {
		message: message, traceback: traceback
	}})
	window.dispatchEvent(event)
}
eel.expose(displayError)

function download_progress(id, current, total){
	const event = new CustomEvent("download_progress", { detail: {
		id: id, current: current, total: total
	}})
	window.dispatchEvent(event)
}
eel.expose(download_progress)
		
function ffmpeg_progress(id, current, total){
	const event = new CustomEvent("ffmpeg_progress", { detail: {
		id: id, current: current, total: total
	}})
	window.dispatchEvent(event)
}
eel.expose(ffmpeg_progress)
		
function finish_download(id, result){
	const event = new CustomEvent("finish_download", { detail: {
		id: id, result: result
	}})
	window.dispatchEvent(event)
}
eel.expose(finish_download)

function abort_download(id){
	const event = new CustomEvent("abort_download", { detail: {
		id: id
	}})
	window.dispatchEvent(event)
}
eel.expose(abort_download)
