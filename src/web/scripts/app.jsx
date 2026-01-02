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
		console.log(results)
		setShowResults(true)
		setResultsTitle(results.title)
		setResultsAuthor(results.author)
		setResultsImage(results.thumb)
		setResultsType(results.type)
		setResultsStreams(results.streams)
	}

	return (
		<React.Fragment>
			<Header/>
			<div className={`loader ${isLoading ? "anim" : ""}`}></div>
			<Search value={search} setValue={setSearch} canSearch={canSearch} onSearch={onSearch}/>
			<ResultsPopup
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
			/>
		</React.Fragment>
	)
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>)
