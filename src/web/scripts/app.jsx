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

	React.useEffect(() => {
		window.download_progress = function (id, current, total){
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === id)
				if (!exists) return prev
				return prev.map(item =>
					item.id === id
						? { ...item, status: "download", progress: Math.round(current * 100 / total) }
						: item
				)
			})
		}
		eel.expose(window.download_progress, "download_progress")
		
		window.ffmpeg_progress = function (id, current, total){
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === id)
				if (!exists) return prev
				return prev.map(item =>
					item.id === id
						? { ...item, status: "ffmpeg", progress: Math.round(current * 100 / total) }
						: item
				)
			})
		}
		eel.expose(window.ffmpeg_progress, "ffmpeg_progress")
		
		window.finish_download = function (id, result){
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === id)
				if (!exists) return prev
				return prev.map(item =>
					item.id === id
						? { ...item, status: "finished", file: result}
						: item
				)
			})
		}
		eel.expose(window.finish_download, "finish_download")
		
		window.abort_download = function (id){
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === id)
				if (!exists) return prev
				return prev.map(item =>
					item.id === id
						? { ...item, status: "aborted"}
						: item
				)
			})
		}
		eel.expose(window.abort_download, "abort_download")
	}, [])

	React.useEffect(() => {
		const handler = (e) => {
			setErrorMsg(e.detail.message)
			setErrorTrace(e.detail.traceback)
		}
		window.addEventListener("displayError", handler)
		return () => window.removeEventListener("displayError", handler)
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
			/>
			<ErrorPopup message={errorMsg} traceback={errorTrace}/>
		</React.Fragment>
	)
}
ReactDOM.createRoot(document.getElementById("root")).render(
	<AppProvider>
		<App/>
	</AppProvider>
)
