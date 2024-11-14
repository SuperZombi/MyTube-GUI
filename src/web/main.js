window.resizeTo(window.screen.width/3,window.screen.height);
applyTheme()
window.onload = _=>{
	initSettings()
	initSearch()
	initPopups()
	initStreamTypeRadios()
	initAccountLogin()

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

		let data = await eel.get_downloader_process(url, streams, {"title": title, "author": author})()
		document.querySelector("#search-result .close").click();
		createDownloadElement(data.id, data.title, data.author, data.thumb, data.time)
		eel.download(data.id)
	}
}

eel.expose(finish_download)
function finish_download(id, result){
	let item = document.querySelector(`#downloads-list .download-item[id="${id}"]`)
	item.classList.add("finished")
	item.setAttribute("file", result)
}
eel.expose(abort_download)
function abort_download(id){
	let item = document.querySelector(`#downloads-list .download-item[id="${id}"]`)
	item.classList.add("finished", "aborted")
}


function initSearch(){
	let el = document.querySelector(".search-container")
	let search_but = el.querySelector(".search")
	let input = el.querySelector("input")
	input.onkeydown = e=>{
		if (e.keyCode == 13){
			startSearch(input.value)
		}
	}
	search_but.onclick = _=>{startSearch(input.value)}

	let clipboard = el.querySelector(".paste")
	clipboard.onclick = _=>{
		navigator.permissions.query({ name: "clipboard-read" }).then((result) => {
			if (result.state === "granted" || result.state === "prompt") {
				navigator.clipboard.readText().then((clipText) => {
					input.value = clipText
					search_but.click()
				})
			}
		})
	}
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
		// popup.onclick = e=>{
		// 	if (!e.target.closest(".popup-wrapper")){
		// 		close()
		// 	}
		// }
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
	document.querySelector(".loader").classList.remove("anim")
	document.querySelector(".search-container").classList.remove("disabled")
	if (info){
		let popup = document.querySelector("#search-result")
		popup.classList.add("show")
		popup.setAttribute("url", link.trim())
		setTimeout(_=>{
			const closeHandler = _=>{
				popup.removeEventListener("close", closeHandler, true);
				popup.removeAttribute("url")
			}
			popup.addEventListener("close", closeHandler, true)
		}, 1000)
		processResults(info, popup.querySelector(".content"))
	}
}

function processResults(results, element){
	let img = element.querySelector(".video-thumb")
	img.src = results.thumb
	let title = element.querySelector("[name=video-title]")
	title.value = results.title
	let author = element.querySelector("[name=video-author]")
	author.value = results.author
	document.querySelector(".stream-selectors").innerHTML = ""
	createSelect(results.streams.video, "video")
	createSelect(results.streams.audio, "audio")
	let radio_input = null
	if (results.type == "music"){
		radio_input = document.querySelector(".radio-tabs input[value=music]")
	} else {
		radio_input = document.querySelector(".radio-tabs input[value=video]")
	}
	radio_input.checked = true;
	radio_input.onchange();
}

function createSelect(streams, type){
	let selected_el = document.createElement("div")
	selected_el.setAttribute("name", type)
	selected_el.appendChild(createStreamElement(streams[0], type))
	document.querySelector(".stream-selectors").appendChild(selected_el)

	let left_menu = document.querySelector("#search-result .left-menu")
	let menu_el = document.createElement("div")
	menu_el.className = "select"
	if (type == "video"){
		menu_el.innerHTML = `<h3>Select the Video:</h3>`
	}
	else if (type == "audio"){
		menu_el.innerHTML = `<h3>Select the Audio:</h3>`
	}
	else {
		menu_el.innerHTML = `<h3>Select the Stream:</h3>`
	}
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
				<span>${stream.quality}</span>${stream.extra ? `<span>(${stream.extra})` : ""}</span>
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

eel.expose(displayError)
function displayError(message){
	let popup = document.querySelector("#error-popup")
	let area = popup.querySelector(".content")
	let el = document.createElement("div")
	el.className = "text"
	el.innerText = message
	area.appendChild(el)
	popup.classList.add("show")
	const errorHandler = _=>{
		popup.removeEventListener("close", errorHandler, true);
		area.innerHTML = ""
	}
	popup.addEventListener("close", errorHandler, true)
}


function createDownloadElement(id, title, author, cover, time){
	let div = document.createElement('div');
	div.className = "download-item"
	div.setAttribute("id", id)
	div.innerHTML = `
		<img class="cover" src="${cover}"><div class="progress"></div>
		<div class="info">
			<div>
				<div class="title">${title}</div>
				<div class="author">${author}</div>
				<div class="sub">
					<div class="time">${time}</div><div class="percent"></div>
				</div>
			</div>
			<div class="abort"><i class="fa-solid fa-circle-xmark"></i></div>
			<div class="open-file"><i class="fa-solid fa-folder"></i></div>
		</div>
	`
	div.querySelector(".abort").onclick = _=>{
		eel.abort_download(id)
	}
	div.querySelector(".open-file").onclick = _=>{
		eel.open_output_file(div.getAttribute("file"))
	}
	document.querySelector("#downloads-list").appendChild(div)
}

eel.expose(download_progress)
function download_progress(id, current, total){
	let el = document.querySelector(`#downloads-list .download-item[id="${id}"]`)
	el.style.setProperty("--percent", Math.round(current * 100 / total));
}


function Toast(message, color=null){
	let el = document.querySelector("#snackbar")
	el.innerHTML = message
	el.classList.add("show")
	if (color == "ok"){
		el.classList.add("success")
	}
	setTimeout(_=>{
		el.classList.remove("show", "success", "danger")
	}, 3000);
}

async function logout_user(){
	if (confirm("Are you sure want to log out?")){
		await eel.logout_user()
		initLoginButton(false)
	}
}
async function login_user(){
	let button = document.querySelector("#login_button")
	button.disabled = true
	let result = await eel.login_user()()
	if (result){
		Toast("Login successfully", "ok")
		initLoginButton(true)
	}
	button.disabled = false
}
function initLoginButton(logined=false){
	let button = document.querySelector("#login_button")
	let text = button.querySelector("span")
	let icon = button.querySelector("i")
	if (logined){
		text.innerHTML = "Sign out"
		icon.className = "fa-solid fa-right-from-bracket"
		button.classList.add("danger")
		button.onclick = _=>{logout_user()}
	} else {
		text.innerHTML = "Sign in"
		icon.className = "fa-solid fa-right-to-bracket"
		button.classList.remove("danger")
		button.onclick = _=>{login_user()}
	}
}
async function initAccountLogin(){
	let logined = await eel.is_user_logined()()
	initLoginButton(logined)
}
function applyTheme(name="auto"){
	if (name == "auto"){
		const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
		if (darkThemeMq.matches) {
			document.documentElement.setAttribute("theme", "dark")
		} else {
			document.documentElement.setAttribute("theme", "light")
		}
	}
	else {
		document.documentElement.setAttribute("theme", name)
	}
}
async function initSettings(){
	document.querySelector(".settings-button").onclick = _=>{
		let popup = document.querySelector("#settings")
		popup.classList.add("show")
	}
	let area = document.querySelector("#settings .content")
	let app_ver = await eel.get_app_version()()
	document.querySelector("#app_version").innerHTML = app_ver

	let SETTINGS = await eel.request_settings()()
	
	let theme_sel = area.querySelector('[name="theme"]')
	theme_sel.value = SETTINGS.theme
	applyTheme(SETTINGS.theme)
	theme_sel.onchange = async _=>{
		applyTheme(theme_sel.value)
		await eel.change_setting("theme", theme_sel.value)
	}

	let out_but = area.querySelector("#output_folder")
	let out_inp = area.querySelector('input[name="output_folder"]')
	out_inp.value = SETTINGS.output_folder
	out_but.onclick = async _=>{
		let answ = await eel.request_folder()()
		if (answ){
			await eel.change_setting("output_folder", answ)
			out_inp.value = answ
		}
	}
}
