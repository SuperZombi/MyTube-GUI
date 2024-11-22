window.resizeTo(window.screen.width/3,window.screen.height);
applyTheme()
var LANG = new Language_Engine()
window.onload = _=>{
	initSettings()
	initSearch()
	initPopups()
	initStreamTypeRadios()
	initAccountLogin()
	check_updates()

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
		document.querySelector(".search-container input").value = ""
		await checkDonateNotification()
		createDownloadElement(data.id, data.title, data.author, data.thumb, data.time)
		eel.download(data.id)
	}
}

function getDownloadItem(id){
	return document.querySelector(`#downloads-list .download-item[id="${id}"]`)
}
eel.expose(download_progress)
function download_progress(id, current, total){
	getDownloadItem(id).style.setProperty("--percent", Math.round(current * 100 / total));
}
eel.expose(finish_download)
function finish_download(id, result){
	let item = getDownloadItem(id)
	item.classList.add("finished")
	item.setAttribute("file", result)
}
eel.expose(abort_download)
function abort_download(id){
	getDownloadItem(id).classList.add("finished", "aborted")
}

function initSearch(){
	let el = document.querySelector(".search-container")
	let search_but = el.querySelector(".search")
	let del_but = el.querySelector(".close")
	let input = el.querySelector("input")
	input.onkeydown = e=>{
		if (e.keyCode == 13){
			startSearch(input.value)
		}
	}
	search_but.onclick = _=>{startSearch(input.value)}
	del_but.onclick = _=>{input.value=""}

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
	let div = document.createElement("div")
	div.className = "stream"
	div.setAttribute("itag", stream.itag)

	let icon, quality, extra = "";
	if (type == "video"){
		icon = 'fa-video'
		quality = `${stream.quality}<sub>p</sub>`
		if (stream.extra){
			extra = `<span>•</span><span>${stream.extra}<sub>fps</sub></span>`
		}
	}
	else if (type == "audio"){
		icon = 'fa-music'
		quality = `${stream.quality}<sub>kbps</sub>`
		if (stream.extra){
			extra = `<span>•</span><span style="font-size:smaller">${stream.extra.toUpperCase()}</span>`
		}
	}
	div.innerHTML = `
		<div class="container"><i class="fa-solid ${icon}"></i></div>
		<div class="container-details">
			<div class="container-details-head">
				<span>${quality}</span>${extra}
			</div>
			<div class="container-details-tags">
				<span class="filesize">${humanFileSize(stream.filesize)}</span><span>${stream.codec}</span>
			</div>
		</div>`
	return div;
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
	let abort_but = div.querySelector(".abort")
	LANG.set(abort_but, "abort_download", "title")
	abort_but.onclick = _=>{
		eel.abort_download(id)
	}
	let open_file_but = div.querySelector(".open-file")
	LANG.set(open_file_but, "open_file", "title")
	open_file_but.onclick = _=>{
		eel.open_output_file(div.getAttribute("file"))
	}
	document.querySelector("#downloads-list").appendChild(div)
}


function AdsTemplate(name){
	if (name == "donate"){
		createAdElement(
			LANG.get("donate_text"),
			LANG.get("donate_button", "Donate"),
			close=>{
				window.open("https://donatello.to/super_zombi","_blank")
				close()
			}
		)
	}
}
function createAdElement(text, action_text="", action=null){
	let div = document.createElement('div');
	div.className = "download-item ads"
	div.innerHTML = `
		<div class="ads-content">
			<div class="text">${text}</div>
			${action_text ? `<div class="tiny-button action">${action_text}</div>` : ""}
		</div>
		<div class="abort"><i class="fa-solid fa-circle-xmark"></i></div>
	`
	const close = function(){
		div.classList.add("disappear")
		setTimeout(_=>{div.classList.add("hide")}, 500)
		setTimeout(_=>{div.remove()}, 1000)
	}
	let close_but = div.querySelector(".abort")
	close_but.onclick = close
	if (action){
		let act_but = div.querySelector(".action")
		if (act_but){
			act_but.onclick = _=>{action(close)}
		}
	}
	document.querySelector("#downloads-list").appendChild(div)
}
async function checkDonateNotification(){
	function checkLastNotificationTime(){
		let currentTime = Math.floor(Date.now() / 1000);
		let lastNotificationTime = localStorage.getItem('lastNotificationTime');
		if (!lastNotificationTime || (currentTime - lastNotificationTime > 12*60*60)) {
			return true;
		} else { return false; }
	}
	function after(){
		let currentTime = Math.floor(Date.now() / 1000);
		localStorage.setItem('lastNotificationTime', currentTime);
	}
	if (checkLastNotificationTime()){
		AdsTemplate("donate")
		after()
		await sleep(1000)
	}
}


async function logout_user(){
	if (confirm(LANG.get("confirm_logout", "Are you sure?"))){
		await eel.logout_user()
		initLoginButton(false)
	}
}
async function login_user(){
	let button = document.querySelector("#login_button")
	button.disabled = true
	let result = await eel.login_user()()
	if (result){
		Toast(LANG.get("login_success_msg", "Login successfully"), "ok")
		initLoginButton(true)
	}
	button.disabled = false
}
function initLoginButton(logined=false){
	let button = document.querySelector("#login_button")
	let text = button.querySelector("span")
	let icon = button.querySelector("i")
	if (logined){
		LANG.set(text, "account_signout")
		icon.className = "fa-solid fa-right-from-bracket"
		button.classList.add("danger")
		button.onclick = _=>{logout_user()}
	} else {
		LANG.set(text, "account_signin")
		icon.className = "fa-solid fa-right-to-bracket"
		button.classList.remove("danger")
		button.onclick = _=>{login_user()}
	}
}
async function initAccountLogin(){
	let logined = await eel.is_user_logined()()
	initLoginButton(logined)
}

async function check_updates(){
	let avaliable = await eel.check_updates()()
	if (avaliable){
		let el = document.querySelector("#update_avalible")
		el.classList.add("show")
		LANG.set(el, "update_avalible", "title")
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

	let selects_actions = {
		"theme": val=>{applyTheme(val)},
		"language": async val=>{
			let lang_data = await eel.get_lang_data(val)();
			LANG.update(lang_data)
		}
	}

	area.querySelectorAll('select').forEach(select=>{
		select.value = SETTINGS[select.name]
		selects_actions[select.name](SETTINGS[select.name])
		select.onchange = async _=>{
			selects_actions[select.name](select.value)
			await eel.change_setting(select.name, select.value)
		}
	})

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
