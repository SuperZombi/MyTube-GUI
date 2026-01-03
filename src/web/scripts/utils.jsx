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
function LANG({ id, vars = {} }) {
	const { langData } = useApp()
	let text = langData[id] || id;
	for (const key in vars) {
		text = text.replaceAll(`{${key}}`, vars[key]);
	}
	return text
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
// function Toast(message, color=null){
// 	let el = document.querySelector("#snackbar")
// 	el.innerHTML = message
// 	el.classList.add("show")
// 	if (color == "ok"){
// 		el.classList.add("success")
// 	}
// 	setTimeout(_=>{
// 		el.classList.remove("show", "success", "danger")
// 	}, 3000);
// }
function humanFileSize(size) {
	var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return +((size / Math.pow(1024, i)).toFixed(1)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
