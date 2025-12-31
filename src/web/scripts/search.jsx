const Search = ({value, setValue, canSearch, onSearch}) => {
	const searchHandler = _=>{
		if (value.trim() != ""){
			onSearch(value.trim())
		}
	}
	const handleKeyDown = event => {
		if (event.keyCode == 13){
			searchHandler()
		}
	}
	const handlePaste = async _=>{
		navigator.permissions.query({ name: "clipboard-read" }).then(result => {
			if (result.state === "granted" || result.state === "prompt") {
				navigator.clipboard.readText().then(clipText => {
					setValue(clipText)
					if (clipText.trim() != ""){
						onSearch(clipText.trim())
					}
				})
			}
		})
	}
	return (
		<div className="search-wrapper">
			<div className={`search-container ${canSearch ? "" : "disabled"}`}>
				<i className="fa-solid fa-magnifying-glass search" onClick={searchHandler}></i>
				<input placeholder="Search URL"
					value={value}
					onInput={e=>setValue(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<i className="fa-regular fa-clipboard paste" onClick={handlePaste}></i>
				<i className="fa-solid fa-xmark close" onClick={_=>setValue("")}></i>
			</div>
		</div>
	)
}
