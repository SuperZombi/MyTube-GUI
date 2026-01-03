const ErrorPopup = ({
	message, traceback,
	setMessage, setTraceback,
	showReload, setShowReload
}) => {
	const [show, setShow] = React.useState(false)
	React.useEffect(_=>{
		if (message){
			setShow(true)
		}
	}, [message])
	React.useEffect(_=>{
		if (!show){
			const timer = setTimeout(_=>{
				setMessage(null)
				setTraceback(null)
				setShowReload(false)
			}, 500)
			return _=>{
				clearTimeout(timer)
			}
		}
	}, [show])
	return (
		<Popup id="error-popup" show={show} setShow={setShow}>
			<div className="content">
				<code style={{whiteSpace: "normal"}}>
					{message}
				</code>
				{showReload ? (
					<div className="simple-button" style={{
						width: "fit-content",
						margin: "auto",
						marginTop: "10px"
					}} onClick={_=>window.location.reload()}>
						<LANG id="reload"/>
					</div>
				) : null}
				{traceback ? (
					<details>
						<summary>
							<div className="simple-button"><LANG id="details"/></div>
						</summary>
						<code style={{marginTop: "10px"}}>
							{traceback}
						</code>
					</details>
				) : null}
			</div>
		</Popup>
	)
}
