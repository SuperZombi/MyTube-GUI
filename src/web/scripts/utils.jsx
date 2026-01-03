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

const AppContext = React.createContext()
const AppProvider = ({children}) => {
	const supportedLangs = ["en", "ru", "uk"]
	const userLang = navigator.language?.slice(0, 2).toLowerCase()
	const [language, setLanguage] = React.useState(supportedLangs.includes(userLang) ? userLang : 'en')
	const [langData, setLangData] = React.useState({})

	React.useEffect(() => {
		fetch(`locales/${language}.json`).then(res => res.json()).then(setLangData)
	}, [language])

	const value = {
		language, setLanguage, langData,
	}
	return (
		<AppContext.Provider value={value}>
			{children}
		</AppContext.Provider>
	)
}
function useApp() {
	return React.useContext(AppContext)
}
function LANG({ id, vars = {}, html = false }) {
	const { langData } = useApp()
	let text = langData[id] || id;
	for (const key in vars) {
		text = text.replaceAll(`{${key}}`, vars[key]);
	}
	if (!html) { return text }
	return (
		<span
			dangerouslySetInnerHTML={{ __html: text }}
		/>
	)
}


const ToastContext = React.createContext(null)
function useToast() {
	return React.useContext(ToastContext)
}
const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = React.useState([])

	function showToast({
		text,
		type = "info",
		duration = 3000
	}) {
		const id = crypto.randomUUID();
		setToasts(prev => [
			...prev,
			{ id, text, type, hidden: false }
		])
		setTimeout(() => {
			setToasts(prev =>
				prev.map(t =>
					t.id === id
						? { ...t, hidden: true }
						: t
				)
			)
		}, duration)
		setTimeout(() => {
			setToasts(prev =>
				prev.filter(t => t.id !== id)
			)
		}, duration + 500)
	}

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<div id="snackbar">
				{toasts.map(t => (
					<div key={t.id} className={
						`toast ${t.type} ${t.hidden ? "hide" : ""}`
					}>
						{t.text}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	)
}

function humanFileSize(size) {
	var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return +((size / Math.pow(1024, i)).toFixed(1)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
