const ResultsPopup = ({
	show, setShow,
	url, streams,
	title, author, image,
	setTitle, setAuthor,
	type, setType,
	onDownload,
	selectedVideo, setSelectedVideo,
	selectedAudio, setSelectedAudio,
	selectedCombined, setSelectedCombined,
}) => {
	const handleChangeType = event => {
		setType(event.target.value)
	}
	const [pickerOpen, setPickerOpen] = React.useState(false)
	const [pickerType, setPickerType] = React.useState(null)
	const closePicker = _=>{
		setPickerOpen(false)
	}
	const openPicker = (type) => {
		setPickerOpen(true)
		setPickerType(type)
	}

	React.useEffect(_=>{
		if ((type == "video" && streams.video?.length == 0) || (type == "music" && streams?.audio.length == 0)){
			setType("combined")
		}
	}, [streams])

	const downloadAction = _=> {
		const result = type == "video" ? {
			"video": selectedVideo.itag,
			"audio": selectedAudio.itag
		} : type == "music" ? {
			"audio": selectedAudio.itag
		} : type == "combined" ? {
			"video": selectedCombined.itag
		} : null

		onDownload(url, result, {"title": title, "author": author})
	}

	return (
		<Popup id="search-result" show={show} setShow={setShow}>
			<div className={`left-menu ${pickerOpen ? "open" : ""}`}>
				<i className="fa-regular fa-circle-xmark close" onClick={closePicker}></i>
				<StreamPicker
					streams={streams} type={pickerType} setPickerOpen={setPickerOpen}
					selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}
					selectedAudio={selectedAudio} setSelectedAudio={setSelectedAudio}
					selectedCombined={selectedCombined} setSelectedCombined={setSelectedCombined}
				/>
			</div>
			<div className="content">
				<img className="video-thumb" src={image} draggable={false}/>
				<div className="metadata">
					<span>
						<span lang_="video_title">Title</span>:
					</span>
					<span>
						<input name="video-title" type="text"
							value={title} onInput={e=>setTitle(e.target.value)}
						/>
					</span>
					<span>
						<span lang_="video_author">Author</span>:
					</span>
					<span>
						<input name="video-author" type="text"
							value={author} onInput={e=>setAuthor(e.target.value)}
						/>
					</span>
				</div>
				<hr/>

				<div className="radio-tabs">
					<label>
						<input type="radio" name="container-type" value="video"
							checked={type == "video"}
							onChange={handleChangeType}
						/>
						<span lang_="stream_video">Video</span>
					</label>
					<label>
						<input type="radio" name="container-type" value="music"
							checked={type == "music"}
							onChange={handleChangeType}
						/>
						<span lang_="stream_music">Music</span>
					</label>
					<label>
						<input type="radio" name="container-type" value="combined"
							checked={type == "combined"}
							onChange={handleChangeType}
						/>
						<span>Combined</span>
					</label>
				</div>

				<div className="stream-selectors">
					{
						(type == "video" && streams.video?.length > 0 && streams.audio?.length > 0) ? (
							<React.Fragment>
								<StreamCard
									info={selectedVideo}
									type="video"
									onClick={_=>openPicker("video")}
								/>
								<StreamCard
									info={selectedAudio}
									type="audio"
									onClick={_=>openPicker("audio")}
								/>
							</React.Fragment>
						) : (type == "music" && streams.audio?.length > 0) ? (
							<React.Fragment>
								<StreamCard
									info={selectedAudio}
									type="audio"
									onClick={_=>openPicker("audio")}
								/>
							</React.Fragment>
						) : (type == "combined" && streams.combined?.length > 0) ? (
							<React.Fragment>
								<StreamCard
									info={selectedCombined}
									type="video"
									onClick={_=>openPicker("combined")}
								/>
							</React.Fragment>
						) : <h3 style={{marginLeft: "1rem"}}>No streams</h3>
					}
				</div>
				<button className="download" onClick={downloadAction}>
					<i className="fa-solid fa-circle-down"></i>
					<span lang_="download_button">Download</span>
				</button>
			</div>
		</Popup>
	)
}

const StreamPicker = ({
	streams, type, setPickerOpen,
	selectedVideo, setSelectedVideo,
	selectedAudio, setSelectedAudio,
	selectedCombined, setSelectedCombined
}) => {
	const array = type == "video" ? streams.video : type == "audio" ? streams.audio : type == "combined" ? streams.combined : null
	const selectedStream = type == "video" ? selectedVideo : type == "audio" ? selectedAudio : type == "combined" ? selectedCombined : null
	const setSelected = type == "video" ? setSelectedVideo : type == "audio" ? setSelectedAudio : type == "combined" ? setSelectedCombined : null
	return (
		<React.Fragment>
			<h3>
				{(type == "video" || type == "combined") ? "Select the Video:" : type == "audio" ? "Select the Audio:" : "Select the Stream:"}
			</h3>
			<div className="select show">
				{
					array?.length > 0 ? type == "audio" ? (
						Object.entries(array.reduce((acc, item) => {
							if (!acc[item.lang]) {
								acc[item.lang] = []
							}
							acc[item.lang].push(item)
							return acc
						}, {})).map(([lang, elements]) => (
							<details key={lang} name="lang-picker"
								className={
									elements.some(stream => stream.itag == selectedStream?.itag) ? "selected" : ""
								}
								open={elements.some(
									stream => stream.itag == selectedStream?.itag
								)}
							>
								<summary>{lang}</summary>
								<div className="data">
									{elements.map(stream => (
										<StreamCard info={stream} type={type}
											key={stream.itag}
											selected={selectedStream?.itag == stream.itag}
											onClick={_=>{setSelected(stream);setPickerOpen(false)}}
										/>
									))}
								</div>
							</details>
						))
					) : array.map(stream=>(
						<StreamCard info={stream} type={type}
							key={stream.itag}
							selected={selectedStream?.itag == stream.itag}
							onClick={_=>{setSelected(stream);setPickerOpen(false)}}
						/>
					)) : null
				}
			</div>
		</React.Fragment>
	)
}

const StreamCard = ({
	info, type, selected, onClick
}) => {
	if (!info) return
	return (
		<div className={`stream ${selected ? "selected" : ""}`} onClick={onClick}>
			<div className="container">
				<i className={`fa-solid ${(type == "video" || type == "combined") ? "fa-video" : "fa-music"}`}></i>
			</div>
			<div className="container-details">
				<div className="container-details-head">
					<span>
						{info.quality}
						<sub>{(type == "video" || type == "combined") ? "p" : "kbps"}</sub>
					</span>
					{info.fps ? (
						<React.Fragment>
							<span>•</span>
							<span>
								{info.fps}
								<sub>fps</sub>
							</span>
						</React.Fragment>
					) : null}
					{info.lang ? (
						<React.Fragment>
							<span>•</span>
							<span>{info.lang.toUpperCase()}</span>
						</React.Fragment>
					) : null}
				</div>
				<div className="container-details-tags">
					{info.filesize ? (
						<span className="filesize">{humanFileSize(info.filesize)}</span>
					) : null}
					{info.codec ? (
						<span>{info.codec}</span>
					) : null}
				</div>
			</div>
		</div>
	)
}
