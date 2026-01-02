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

	React.useEffect(() => {
		eel.expose(download_progress)
		function download_progress(id, current, total){
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === id)
				if (exists){
					return prev.map(item =>
						item.id === id
							? { ...item, status: "download", progress: Math.round(current * 100 / total) }
							: item
					)
				}
			})
		}
		eel.expose(ffmpeg_progress)
		function ffmpeg_progress(id, current, total){
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === id)
				if (exists){
					return prev.map(item =>
						item.id === id
							? { ...item, status: "ffmpeg", progress: Math.round(current * 100 / total) }
							: item
					)
				}
			})
		}
		eel.expose(finish_download)
		function finish_download(id, result){
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === id)
				if (exists){
					return prev.map(item =>
						item.id === id
							? { ...item, status: "finished", file: result}
							: item
					)
				}
			})
		}
		eel.expose(abort_download)
		function abort_download(id){
			setDownloadItems(prev => {
				const exists = prev.find(item => item.id === id)
				if (exists){
					return prev.map(item =>
						item.id === id
							? { ...item, status: "aborted"}
							: item
					)
				}
			})
		}

		eel.expose(displayError)
		function displayError(message, traceback="", on_close=null){
			console.error(message)
		}
	}, [])

	React.useEffect(_=>{
		setIsLoading(false)
		setCanSearch(true)
	}, [])

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
			<Settings show={showSettings} setShow={setShowSettings}/>
		</React.Fragment>
	)
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>)
