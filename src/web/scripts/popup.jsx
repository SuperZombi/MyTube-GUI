const Popup = ({show, setShow, children, id}) => {
	const BeforeClose = _=>{
		if (show){
			setShow(false)
		}
	}
	return (
		<div className={`popup ${show ? "show" : ""}`}
			onClick={e=>e.target.classList.contains("popup") ? BeforeClose() : null}
			id={id}
		>
			<div className="popup-wrapper">
				<i className="fa-regular fa-circle-xmark close" onClick={BeforeClose}></i>
				{children}
			</div>
		</div>
	)
}
