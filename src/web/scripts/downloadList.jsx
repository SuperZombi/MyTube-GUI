const DownloadList = ({
	items
}) => {
	const onAbort = id=>{
		eel.abort_download(id)
	}
	const openExplorer = file=>{
		if (file){
			eel.open_output_file(file)
		}
	}
	return (
		<div id="downloads-list">
			{items.map(item=>(
				<DownloadItem data={item} key={item.id}
					onAbort={onAbort}
					openExplorer={openExplorer}
				/>
			))}
		</div>
	)
}
const DownloadItem = ({
	data, onAbort, openExplorer
}) => {
	return (
		<div className={`download-item ${data.status == "finished" ? "finished" : data.status == "aborted" ? "finished aborted" : ""}`}
			style={{"--percent": data.progress}} status={data.status}
		>
			<img className="cover" src={data.thumb} draggable={false}/>
			<div className="progress"></div>
			<div className="info">
				<div className="metadata">
					<div className="title">{data.title}</div>
					<div className="author">{data.author}</div>
					<div className="sub">
						<div className="time">{data.time}</div>
						<div className="percent"></div>
						<div className="status"></div>
					</div>
				</div>
				<div className="abort" onClick={_=>onAbort(data.id)}><i className="fa-solid fa-circle-xmark"></i></div>
				<div className="open-file" onClick={_=>openExplorer(data.file)}><i className="fa-solid fa-folder"></i></div>
			</div>
		</div>
	)
}
