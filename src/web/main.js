window.resizeTo(window.screen.width/3,window.screen.height);

window.onload = _=>{
	initSearch()
	initPopups()
	initSelects()
	startSearch("https://www.youtube.com/watch?v=Xoio2qensyw")
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
	})
}
function initSelects(){
	document.querySelectorAll(".select").forEach(select=>{
		initSelect(select)
	})
	document.body.onclick = e=>{
		let target = e.target.closest(".select")
		document.querySelectorAll(".select.open").forEach(select=>{
			if (target != select){
				select.classList.remove("open")
			}
		})
	}
}
function initSelect(select){
	let header = select.querySelector(".selected")
	select.onclick = _=>{
		select.classList.toggle("open")
	}
	function choose(element){
		element.classList.add("hide")
		let cloned = element.cloneNode(true);
		header.innerHTML = ""
		header.appendChild(cloned)
	}
	select.querySelectorAll(".list > *").forEach(item=>{
		item.onclick = _=>{
			select.querySelectorAll(".list > .hide").forEach(hidden=>{
				hidden.classList.remove("hide")
			})
			choose(item)
		}
	})
	choose(select.querySelector(".list > *"))	
}

async function startSearch(link){
	if (link.trim() == ""){return}
	document.querySelector(".loader").classList.add("anim")
	document.querySelector(".search-container").classList.add("disabled")

	let info = await eel.get_vid_info(link)()

	let popup = document.querySelector("#search-result")
	popup.classList.add("show")
	document.querySelector(".loader").classList.remove("anim")
	document.querySelector(".search-container").classList.remove("disabled")
	setTimeout(_=>{
		const closeHandler = _=>{
			popup.removeEventListener("close", closeHandler, true);
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
	console.log(streams)
	let select = document.createElement("div")
	select.className = "select"
	select.innerHTML = '<div class="selected"></div><div class="list"></div>'
	let parrent = select.querySelector(".list")
	streams.forEach(stream=>{
		let el = createStreamElement(stream, type)
		parrent.appendChild(el)
	})
	initSelect(select)
	document.querySelector(".stream-selectors").appendChild(select)
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
				<span>${humanFileSize(stream.filesize)}</span><span>${stream.codec}</span>
			</div>
		</div>`
	return div;
}

function humanFileSize(size) {
	var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return +((size / Math.pow(1024, i)).toFixed(2)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
