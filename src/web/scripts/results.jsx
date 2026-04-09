const ResultsPopup = ({
	show, setShow,
	url, streams,
	title, author, image,
	setTitle, setAuthor,
	subtitles,
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
		setPickerOpen(false)
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
	const t = useLang()

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
						<span><LANG id="video_title"/></span>:
					</span>
					<span>
						<input name="video-title" type="text"
							value={title} onInput={e=>setTitle(e.target.value)}
						/>
					</span>
					<span>
						<span><LANG id="video_author"/></span>:
					</span>
					<span>
						<input name="video-author" type="text"
							value={author} onInput={e=>setAuthor(e.target.value)}
						/>
					</span>
				</div>
				<div className="line" style={{margin: "1rem 0"}}></div>

				<div className="radio-tabs">
					<label title={t("stream_video")}>
						<input type="radio" name="container-type" value="video"
							checked={type == "video"}
							onChange={handleChangeType}
						/>
						<i className="fa-solid fa-video"></i>
					</label>
					{streams.combined?.length > 0 && (
						<label title={t("stream_combined")}>
							<input type="radio" name="container-type" value="combined"
								checked={type == "combined"}
								onChange={handleChangeType}
							/>
							<i className="fa-solid fa-film"></i>
						</label>
					)}
					<label title={t("stream_music")}>
						<input type="radio" name="container-type" value="music"
							checked={type == "music"}
							onChange={handleChangeType}
						/>
						<i className="fa-solid fa-music"></i>
					</label>
					{subtitles?.length > 0 && (
						<label title={t("subtitles")}>
							<input type="radio" name="container-type" value="subtitles"
								checked={type == "subtitles"}
								onChange={handleChangeType}
							/>
							<i className="fa-solid fa-closed-captioning"></i>
						</label>
					)}
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
						) : (type == "subtitles" && subtitles?.length > 0) ? (
							<React.Fragment>
								{subtitles.map((item, index) => (
									<StreamCard
										key={index}
										info={item}
										type="sub"
										onClick={_=>window.open(item.url, "_blank")}
									/>
								))}
							</React.Fragment>
						) : (
							<h3 style={{marginLeft: "1rem"}}>
								<LANG id="no_streams"/>
							</h3>
						)
					}
				</div>

				{type != "subtitles" && (
					<button className="download" onClick={downloadAction}
						disabled={
						!(
							(type == "video" && streams.video?.length > 0 && streams.audio?.length > 0) ||
							(type == "music" && streams.audio?.length > 0) ||
							(type == "combined" && streams.combined?.length > 0)
						)}
					>
						<i className="fa-solid fa-circle-down"></i>
						<span><LANG id="download_button"/></span>
					</button>
				)}
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

	const grouped = array?.reduce((acc, item) => {
		const lang = item.lang ?? "__single__"
		if (!acc[lang]) acc[lang] = []
		acc[lang].push(item)
		return acc
	}, {})
	const entries = Object.entries(grouped || {})
	const hasMultipleLangs = entries.length > 1 && entries[0][0] !== "__single__"
	return (
		<React.Fragment>
			<h3>
				{(type == "video" || type == "combined") ? <LANG id="select_video"/> : type == "audio" ? <LANG id="select_audio"/> : "Select the Stream:"}
			</h3>
			<div className="select show">
				{
					array?.length > 0 ? ((type == "audio" || type == "combined") && hasMultipleLangs) ? (
						entries.map(([lang, elements]) => {
							const selected = elements.some(stream => stream.itag == selectedStream?.itag)
							return (
								<details key={lang} name={`lang-picker-${type}`}
									className={selected ? "selected" : ""}
									open={selected ? true : false}
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
							)
						})
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
	const quality_map = {
		"2160": "4K",
		"1440": "2K"
	}
	const icons = {
		video: "fa-video",
		combined: "fa-video",
		audio: "fa-music",
		sub: "fa-closed-captioning"
	}
	return (
		<div className={`stream ${selected ? "selected" : ""}`} onClick={onClick}>
			<div className="container">
				<i className={`fa-solid ${icons[type] || ""}`}></i>
			</div>
			<div className="container-details">
				<div className="container-details-head">
					{(type == "video" || type == "combined") && (
						Object.keys(quality_map).includes(String(info.quality)) ? (
							<span>{quality_map[String(info.quality)]}</span>
						) : <span>{info.quality}<sub>p</sub></span>
					)}
					{type == "audio" && <span>{info.quality}<sub>kbps</sub></span>}
					{type == "sub" && <span>{info.name}</span>}
					{info.fps && (
						<React.Fragment>
							<span>•</span>
							<span>
								{info.fps}
								<sub>fps</sub>
							</span>
						</React.Fragment>
					)}
					{info.lang && (
						<React.Fragment>
							<span>•</span>
							<span>{info.lang.toUpperCase()}</span>
						</React.Fragment>
					)}
				</div>
				<div className="container-details-tags">
					{info.filesize && (
						<span className="filesize">{humanFileSize(info.filesize)}</span>
					)}
					{info.codec && (
						<span>{info.codec}</span>
					)}
					{(info.width && info.height) && (
						<span className="res">{info.width}×{info.height}</span>
					)}
					{type == "sub" && <span className="filesize">{info.extension}</span>}
				</div>
			</div>
		</div>
	)
}
