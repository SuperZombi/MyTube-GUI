function sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
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
function humanFileSize(size) {
	var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return +((size / Math.pow(1024, i)).toFixed(2)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}


class Language_Controller {
	constructor(element, key, attribute=""){
		this.element = element
		this.attribute = attribute
		this.key = key
	}
	update(data){
		let value = data[this.key] || ""
		if (value){
			if (this.attribute){
				this.element.setAttribute(this.attribute, value)
			} else {
				this.element.innerHTML = value
			}
		}
	}
}
class Language_Engine {
	constructor() {
		this.data = {}
		this.controllers = []
		window.addEventListener("load", _=>{
			document.querySelectorAll("[lang_]").forEach(el=>{
				this.set(el, el.getAttribute("lang_"))
				el.removeAttribute("lang_")
			})
			document.querySelectorAll("[lang_title]").forEach(el=>{
				this.set(el, el.getAttribute("lang_title"), "title")
				el.removeAttribute("lang_title")
			})
			document.querySelectorAll("[lang_placeholder]").forEach(el=>{
				this.set(el, el.getAttribute("lang_placeholder"), "placeholder")
				el.removeAttribute("lang_placeholder")
			})
		})
	}
	set(element, key, attribute=""){
		let controller = new Language_Controller(element, key, attribute)
		this.controllers.push(controller)
		controller.update(this.data)
	}
	get(key, default_=""){
		return this.data[key] || default_
	}
	update(new_data){
		this.data = new_data
		this.controllers.forEach(controller=>{
			controller.update(this.data)
		})
	}
}

function initPopups(){
	const event = new Event("close");
	document.querySelectorAll(".popup").forEach(popup=>{
		function close(){
			popup.classList.remove("show")
			popup.dispatchEvent(event);
		}
		popup.onmousedown = e=>{
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
