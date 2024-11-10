window.resizeTo(window.screen.width/3,window.screen.height);

window.onload = _=>{
	initSearch()
	initPopups()
	initStreamTypeRadios()
	// startSearch("https://www.youtube.com/watch?v=Xoio2qensyw")

	document.querySelector("#search-result .download").onclick = async _=>{
		let results = document.querySelector("#search-result")
		let url = results.getAttribute("url")
		let title = results.querySelector("[name=video-title]").value
		let author = results.querySelector("[name=video-author]").value
		let download_type = results.querySelector(".radio-tabs input:checked").value

		let streams = {}
		results.querySelectorAll(".stream-selectors > *:not(.hide)").forEach(stream_wrapper=>{
			let name = stream_wrapper.getAttribute("name")
			let itag = stream_wrapper.querySelector(".stream").getAttribute("itag")
			streams[name] = itag
		})

		// console.log(url, download_type, streams, title, author)

		let downloader_id = await eel.get_downloader_process(url, streams, {"title": title, "author": author})()
		let file = await eel.download(downloader_id)()
		console.log(file)

		// console.log(eel.abort(downloader_id))
	}
}

function initSearch(){
	let el = document.querySelector(".search-container")
	let but = el.querySelector("i")
	let input = el.querySelector("input")
	input.onkeydown = e=>{
		if (e.keyCode == 13){
			startSearch(input.value)
		}
	}
	but.onclick = _=>{startSearch(input.value)}
}

function initStreamTypeRadios(){
	document.querySelectorAll(".radio-tabs input").forEach(input=>{
		input.onchange = _=>{
			if (input.value == "video"){
				document.querySelector('.stream-selectors [name="video"]').classList.remove("hide")
				document.querySelector('.stream-selectors [name="audio"]').classList.remove("hide")
			}
			else if (input.value == "music"){
				document.querySelector('.stream-selectors [name="video"]').classList.add("hide")
				document.querySelector('.stream-selectors [name="audio"]').classList.remove("hide")
			}
		}
	})
}

function initPopups(){
	const event = new Event("close");
	document.querySelectorAll(".popup").forEach(popup=>{
		function close(){
			popup.classList.remove("show")
			popup.dispatchEvent(event);
		}
		popup.onclick = e=>{
			if (!e.target.closest(".popup-wrapper")){
				close()
			}
		}
		popup.querySelector(".close").onclick = _=>{
			close()
		}
		let left_menu = popup.querySelector(".left-menu")
		if (left_menu){
			let close = left_menu.querySelector(".close")
			if (close){
				close.onclick = _=>{
					left_menu.classList.remove("open")
				}
			}
		}
	})
}

async function startSearch(link){
	if (link.trim() == ""){return}
	document.querySelector(".loader").classList.add("anim")
	document.querySelector(".search-container").classList.add("disabled")

	let info = await eel.get_vid_info(link.trim())()

	let popup = document.querySelector("#search-result")
	popup.classList.add("show")
	popup.setAttribute("url", link.trim())
	document.querySelector(".loader").classList.remove("anim")
	document.querySelector(".search-container").classList.remove("disabled")
	setTimeout(_=>{
		const closeHandler = _=>{
			popup.removeEventListener("close", closeHandler, true);
			popup.removeAttribute("url")
		}
		popup.addEventListener("close", closeHandler, true)
	}, 1000)
	processResults(info, popup.querySelector(".content"))
}

function processResults(results, element){
	let img = element.querySelector(".video-thumb")
	img.src = results.thumb
	let title = element.querySelector("[name=video-title]")
	title.value = results.name
	let author = element.querySelector("[name=video-author]")
	author.value = results.author
	createSelect(results.streams.video, "video")
	createSelect(results.streams.audio, "audio")
}

function createSelect(streams, type){
	let selected_el = document.createElement("div")
	selected_el.setAttribute("name", type)
	selected_el.appendChild(createStreamElement(streams[0], type))
	document.querySelector(".stream-selectors").appendChild(selected_el)

	let left_menu = document.querySelector("#search-result .left-menu")
	let menu_el = document.createElement("div")
	menu_el.className = "select"
	menu_el.innerHTML = `<h3>Select a Stream:</h3>`
	streams.forEach(stream=>{
		let raw_stream = createStreamElement(stream, type)
		let stream_el = raw_stream.cloneNode(true)
		menu_el.appendChild(stream_el)
		stream_el.onclick = _=>{
			menu_el.querySelectorAll(".stream.selected").forEach(x=>{
				x.classList.remove("selected")
			})
			stream_el.classList.add("selected")
			selected_el.innerHTML = ""
			selected_el.appendChild(raw_stream.cloneNode(true))
			left_menu.classList.remove("open")
		}
	})
	left_menu.appendChild(menu_el)
	menu_el.querySelector(`.stream[itag="${streams[0].itag}"]`).classList.add("selected")

	selected_el.onclick = _=>{
		left_menu.querySelectorAll(".select.show").forEach(x=>{
			x.classList.remove("show")
		})
		left_menu.classList.add("open")
		menu_el.classList.add("show")
	}
}
function createStreamElement(stream, type){
	let icon = type == "video" ? 'fa-video' : 'fa-music'
	let div = document.createElement("div")
	div.className = "stream"
	div.setAttribute("itag", stream.itag)
	div.innerHTML = `
		<div class="container"><i class="fa-solid ${icon}"></i></div>
		<div class="container-details">
			<div class="container-details-head">
				<span>${stream.quality}</span><span>(${stream.extra})</span>
			</div>
			<div class="container-details-tags">
				<span class="filesize">${humanFileSize(stream.filesize)}</span><span>${stream.codec}</span>
			</div>
		</div>`
	return div;
}
function humanFileSize(size) {
	var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return +((size / Math.pow(1024, i)).toFixed(2)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

eel.expose(download_progress)
function download_progress(id, current, total){
	console.log(id, current, total)
}
