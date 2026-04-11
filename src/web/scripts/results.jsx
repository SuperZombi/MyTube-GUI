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
	selectedSubtitles, setSelectedSubtitles
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
		if (type == "subtitles") {
			window.open(selectedSubtitles.url, "_blank")
			setShow(false)
		} else {
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
					selectedSubtitles={selectedSubtitles} setSelectedSubtitles={setSelectedSubtitles}
					subtitles={subtitles}
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
								<StreamCard
									info={selectedSubtitles}
									type="subtitles"
									onClick={_=>openPicker("subtitles")}
								/>
							</React.Fragment>
						) : (
							<h3 style={{marginLeft: "1rem"}}>
								<LANG id="no_streams"/>
							</h3>
						)
					}
				</div>

				<button className="download" onClick={downloadAction}
					disabled={
					!(
						(type == "video" && streams.video?.length > 0 && streams.audio?.length > 0) ||
						(type == "music" && streams.audio?.length > 0) ||
						(type == "combined" && streams.combined?.length > 0) ||
						(type == "subtitles" && subtitles?.length > 0)
					)}
				>
					<i className="fa-solid fa-circle-down"></i>
					<span><LANG id="download_button"/></span>
				</button>
			</div>
		</Popup>
	)
}

const StreamPicker = ({
	streams, type, setPickerOpen,
	selectedVideo, setSelectedVideo,
	selectedAudio, setSelectedAudio,
	selectedCombined, setSelectedCombined,
	subtitles,
	selectedSubtitles, setSelectedSubtitles
}) => {
	const typeMap = {
		video: {
			array: streams.video,
			selected: selectedVideo,
			setSelected: setSelectedVideo
		},
		audio: {
			array: streams.audio,
			selected: selectedAudio,
			setSelected: setSelectedAudio
		},
		combined: {
			array: streams.combined,
			selected: selectedCombined,
			setSelected: setSelectedCombined
		},
		subtitles: {
			array: subtitles,
			selected: selectedSubtitles,
			setSelected: setSelectedSubtitles
		}
	}
	const current = typeMap[type] || {}
	const array = current.array || null
	const selectedStream = current.selected || null
	const setSelected = current.setSelected || null

	const grouped = array?.reduce((acc, item) => {
		const lang = item.lang ?? "__single__"
		if (!acc[lang]) acc[lang] = []
		acc[lang].push(item)
		return acc
	}, {})
	const entries = Object.entries(grouped || {})
	const hasMultipleLangs = entries.length > 1 && entries[0][0] !== "__single__"
	const titleMap = {
		video: <LANG id="select_video" />,
		combined: <LANG id="select_video" />,
		audio: <LANG id="select_audio" />,
		subtitles: <LANG id="select_subtitles" />
	}
	const getStreamId = (stream) => {
		if (stream.itag != null) return `itag-${stream.itag}`
		if (stream.lang) return `sub-${stream.lang}-${stream.extension}-${stream.autogenerated}`
		return null
	}
	return (
		<React.Fragment>
			<h3>{titleMap[type] || "Select the Stream:"}</h3>
			<div className="select show">
				{
					array?.length > 0 ? ((type == "audio" || type == "combined" || type == "subtitles") && hasMultipleLangs) ? (
						entries.map(([lang, elements]) => {
							const selected = elements.some(stream => getStreamId(stream) === getStreamId(selectedStream))
							return (
								<details key={lang} name={`lang-picker-${type}`}
									className={selected ? "selected" : ""}
									open={selected ? true : false}
								>
									<summary>{lang}</summary>
									<div className="data">
										{elements.map((stream, index) => (
											<StreamCard info={stream} type={type}
												key={stream.itag || index}
												selected={getStreamId(selectedStream) === getStreamId(stream)}
												onClick={_=>{setSelected(stream);setPickerOpen(false)}}
											/>
										))}
									</div>
								</details>
							)
						})
					) : array.map((stream, index)=>(
						<StreamCard info={stream} type={type}
							key={stream.itag || index}
							selected={getStreamId(selectedStream) === getStreamId(stream)}
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
		subtitles: "fa-closed-captioning"
	}
	return (
		<div className={`stream ${selected && "selected"} ${type == "sub" && "no-hover"}`} onClick={onClick}>
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
					{type == "subtitles" && <span>{info.name}</span>}
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
					{type == "subtitles" && (
						<span className="subs">{info.extension}</span>
					)}
					{info.autogenerated && <span className="danger">auto</span>}
				</div>
			</div>
		</div>
	)
}
