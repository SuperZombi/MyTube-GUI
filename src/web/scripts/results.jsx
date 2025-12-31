const ResultsPopup = ({
	show, setShow,
	streams,
	title, author, image,
	setTitle, setAuthor,
	type, setType
}) => {
	const handleChangeType = event => {
		setType(event.target.value)
	}

	return (
		<div className={`popup ${show ? "show" : ""}`} id="search-result">
			<div className="popup-wrapper">
				<i className="fa-regular fa-circle-xmark close" onClick={_=>setShow(false)}></i>
				{/*<div className="left-menu">
					<i className="fa-regular fa-circle-xmark close"></i>
				</div>*/}
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

					<div className="stream-selectors"></div>
					<button className="download"><i className="fa-solid fa-circle-down"></i><span lang_="download_button">Download</span></button>
				</div>
			</div>
		</div>
	)
}
