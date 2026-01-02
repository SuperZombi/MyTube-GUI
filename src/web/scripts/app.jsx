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

	const [downloadItems, setDownloadItems] = React.useState([])

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
	}, [])

	React.useEffect(_=>{
		setIsLoading(false)
		setCanSearch(true)
	}, [])

	const onSearch = async val=>{
		setIsLoading(true)
		setCanSearch(false)
		let info = await eel.get_vid_info(val)()
		setIsLoading(false)
		setCanSearch(true)
		processResults(info)
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
	}
	const onDownload = async (url, streams, metadata) => {
		let data = await eel.get_downloader_process(url, streams, metadata)()
		setDownloadItems(prev=>[...prev, data])
		setShowResults(false)
		eel.download(data.id)
	}

	return (
		<React.Fragment>
			<Header/>
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
			/>
			<DownloadList items={downloadItems}/>
		</React.Fragment>
	)
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>)
