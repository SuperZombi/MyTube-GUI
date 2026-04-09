let lastUrl = location.href
let observer = null
const browser = chrome || browser

function isVideoPage() {
	const url = new URL(location.href)
	if (url.pathname === "/watch" && url.searchParams.has("v")) {
		return true
	}
	const shortsMatch = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})$/)
	if (shortsMatch) {
		return true
	}
	return false
}
function waitForElement(selector, callback, timeout = 5000) {
	const observer = new MutationObserver(() => {
		const el = document.querySelector(selector)
		if (el) {
			observer.disconnect()
			callback(el)
		}
	})
	observer.observe(document.body, {
		childList: true,
		subtree: true
	})
	setTimeout(() => {
		observer.disconnect()
	}, timeout)
}

function removeButton() {
	const btn = document.getElementById("mytube-btn")
	if (btn) btn.remove()
}
function createButton() {
	const btn = document.createElement("button")
	btn.id = "mytube-btn"
	btn.style.display = "flex"
	btn.style.padding = "8px"
	btn.style.margin = "auto 10px"
	btn.style.borderRadius = "50%"
	btn.style.border = "1px solid red"
	btn.style.cursor = "pointer"
	btn.style.background = "transparent"
	btn.style.color = "#fff"
	btn.style.fontWeight = "bold"
	btn.style.transition = "0.15s"
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
	svg.setAttribute("viewBox", "0 0 24 24")
	svg.setAttribute("width", "20")
	svg.setAttribute("height", "20")
	const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
	path.setAttribute("d",
		"M11 2.05v2.01A8 8 0 0 0 12 20a8 8 0 0 0 7.94-7h2.01A10 10 0 1 1 11 2.05m7.7 4.66L12 13.4 10.59 12l6.7-6.7L14 2h8v8z"
	)
	path.style.transition = "0.15s"
	path.setAttribute("fill", "red")
	svg.appendChild(path)
	btn.appendChild(svg)
	btn.addEventListener("mouseenter", () => {
		path.setAttribute("fill", "white")
		btn.style.background = "#ff0000"
	})
	btn.addEventListener("mouseleave", () => {
		path.setAttribute("fill", "red")
		btn.style.background = "transparent"
	})
	btn.addEventListener("click", () => {
		window.open(`mytube://?url=${encodeURIComponent(window.location.href)}`, "_self")
	})
	return btn
}

function injectYouTubeButton() {
	waitForElement("#end", container => {
		if (document.getElementById("mytube-btn")) return
		const btn = createButton()
		container.prepend(btn)
	})
}
function injectMusicButton() {
	waitForElement("#right-content", container=>{
		if (document.getElementById("mytube-btn")) return
		const btn = createButton()
		container.prepend(btn)
	})
}
function injectShortsButton() {
	waitForElement("ytd-reel-video-renderer #actions", container=>{
		if (document.getElementById("mytube-btn")) return
		const btn = createButton()
		btn.style.margin = "10px auto"
		container.appendChild(btn)
	})
}

function updateUI() {
	if (!isVideoPage()) {
		removeButton()
		return
	}
	if (location.hostname.includes("music.youtube.com")) {
		injectMusicButton()
	} else {
		if (location.pathname.startsWith("/shorts/")) {
			injectShortsButton()
		} else {
			injectYouTubeButton()
		}
	}
}

function onUrlChange() {
	if (location.href === lastUrl) return
	lastUrl = location.href
	updateUI()
}
observer = new MutationObserver(() => {
	onUrlChange()
})
observer.observe(document.body, {
	childList: true,
	subtree: true
})
updateUI()
