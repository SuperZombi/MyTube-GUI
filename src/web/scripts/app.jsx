applyTheme()
const App = () => {
	const [isLoading, setIsLoading] = React.useState(true)
	const [canSearch, setCanSearch] = React.useState(false)
	const [showResults, setShowResults] = React.useState(false)

	const [search, setSearch] = React.useState("")

	const [resultsTitle, setResultsTitle] = React.useState("")
	const [resultsAuthor, setResultsAuthor] = React.useState("")
	const [resultsImage, setResultsImage] = React.useState("")
	const [resultsStreams, setResultsStreams] = React.useState([])
	const [resultsType, setResultsType] = React.useState("video")
	const [resultsUrl, setResultsUrl] = React.useState("")

	const [selectedVideo, setSelectedVideo] = React.useState(null)
	const [selectedAudio, setSelectedAudio] = React.useState(null)
	const [selectedCombined, setSelectedCombined] = React.useState(null)

	const [downloadItems, setDownloadItems] = React.useState([])

	const [showSettings, setShowSettings] = React.useState(false)

	const [errorMsg, setErrorMsg] = React.useState(null)
	const [errorTrace, setErrorTrace] = React.useState(null)
	const [reloadError, setReloadError] = React.useState(false)

	React.useEffect(() => {
		const handler = (e) => {
			setErrorMsg(e.detail.message)
			setErrorTrace(e.detail.traceback)
		}
		window.addEventListener("displayError", handler)
		return () => window.removeEventListener("displayError", handler)
	}, [])

	const checkDonateNotification = _=>{
		function checkLastNotificationTime(){
			let currentTime = Math.floor(Date.now() / 1000)
			let lastNotificationTime = localStorage.getItem('lastNotificationTime')
			if (!lastNotificationTime || (currentTime - lastNotificationTime > 12*60*60)) {
				return true
			} else { return false }
		}
		if (checkLastNotificationTime()){
			let currentTime = Math.floor(Date.now() / 1000)
			localStorage.setItem('lastNotificationTime', currentTime)
			setDownloadItems(prev=>[...prev, {
				status: "ads",
				id: crypto.randomUUID(),
				text: <LANG id="donate_text" html={true}/>,
				action_text: <LANG id="donate_button" html={true}/>,
				action: _=> window.open("https://donatello.to/super_zombi","_blank")
			}])
		}
	}

	React.useEffect(() => {
		const handler = (e) => {
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === e.detail.id)
				if (!exists) return prev
				return prev.map(item =>
					item.id === e.detail.id ? { ...item,
						status: "download",
						progress: Math.round(e.detail.current * 100 / e.detail.total)
					} : item
				)
			})
		}
		window.addEventListener("download_progress", handler)
		return () => window.removeEventListener("download_progress", handler)
	}, [])

	React.useEffect(() => {
		const handler = (e) => {
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === e.detail.id)
				if (!exists) return prev
				return prev.map(item =>
					item.id === e.detail.id ? {
						...item, status: "ffmpeg",
						progress: Math.round(e.detail.current * 100 / e.detail.total)
					} : item
				)
			})
		}
		window.addEventListener("ffmpeg_progress", handler)
		return () => window.removeEventListener("ffmpeg_progress", handler)
	}, [])

	React.useEffect(() => {
		const handler = (e) => {
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === e.detail.id)
				if (!exists) return prev
				return prev.map(item =>
					item.id === e.detail.id ? {
						...item, status: "finished",
						file: e.detail.result
					} : item
				)
			})
		}
		window.addEventListener("finish_download", handler)
		return () => window.removeEventListener("finish_download", handler)
	}, [])

	React.useEffect(() => {
		const handler = (e) => {
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === e.detail.id)
				if (!exists) return prev
				return prev.map(item =>
					item.id === e.detail.id ? { ...item, status: "aborted"} : item
				)
			})
		}
		window.addEventListener("abort_download", handler)
		return () => window.removeEventListener("abort_download", handler)
	}, [])

	const onReady = _=>{
		setIsLoading(false)
		setCanSearch(true)
	}

	const onSearch = async val=>{
		setIsLoading(true)
		setCanSearch(false)
		let info = await eel.get_vid_info(val)()
		if (info){
			processResults(info)
		}
		setIsLoading(false)
		setCanSearch(true)
		setSearch("")
	}

	const processResults = results=>{
		setShowResults(true)
		setResultsTitle(results.title)
		setResultsAuthor(results.author)
		setResultsImage(results.thumb)
		setResultsType(results.type)
		setResultsStreams(results.streams)
		setResultsUrl(results.url)

		setSelectedVideo(results.select.video || results.streams.video?.[0])
		setSelectedAudio(results.select.audio || results.streams.audio?.[0])
		setSelectedCombined(results.select.combined || results.streams.combined?.[0])
	}
	const onDownload = async (url, streams, metadata) => {
		let data = await eel.get_downloader_process(url, streams, metadata)()
		setDownloadItems(prev=>[...prev, data])
		setShowResults(false)
		eel.download(data.id)
		checkDonateNotification()
	}

	return (
		<React.Fragment>
			<Header setShowSettings={setShowSettings}/>
			<div className={`loader ${isLoading ? "anim" : ""}`}></div>
			<Search value={search} setValue={setSearch} canSearch={canSearch} onSearch={onSearch}/>
			<ResultsPopup
				url={resultsUrl}
				show={showResults}
				setShow={setShowResults}
				streams={resultsStreams}
				title={resultsTitle}
				author={resultsAuthor}
				image={resultsImage}
				setTitle={setResultsTitle}
				setAuthor={setResultsAuthor}
				type={resultsType}
				setType={setResultsType}
				onDownload={onDownload}
				selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}
				selectedAudio={selectedAudio} setSelectedAudio={setSelectedAudio}
				selectedCombined={selectedCombined} setSelectedCombined={setSelectedCombined}
			/>
			<DownloadList items={downloadItems}/>
			<Settings show={showSettings} setShow={setShowSettings} onReady={onReady}
				setErrorMsg={setErrorMsg} setErrorTrace={setErrorTrace}
				setShowReload={setReloadError}
			/>
			<ErrorPopup message={errorMsg} traceback={errorTrace}
				setMessage={setErrorMsg} setTraceback={setErrorTrace}
				showReload={reloadError} setShowReload={setReloadError}
			/>
		</React.Fragment>
	)
}
ReactDOM.createRoot(document.getElementById("root")).render(
	<AppProvider>
		<ToastProvider>
			<App/>
		</ToastProvider>
	</AppProvider>
)
