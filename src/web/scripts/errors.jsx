const ErrorPopup = ({
	message, traceback
}) => {
	const [show, setShow] = React.useState(false)
	React.useEffect(_=>{
		if (message){
			setShow(true)
		}
	}, [message])
	return (
		<Popup id="error-popup" show={show} setShow={setShow}>
			<div className="content">
				<code style={{whiteSpace: "normal"}}>
					{message}
				</code>
				{traceback ? (
					<details>
						<summary>
							<div className="simple-button">Details</div>
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
