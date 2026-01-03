const Settings = ({
	show, setShow, onReady,
	setErrorMsg, setErrorTrace,
	setShowReload
}) => {
	const [appVer, setAppVer] = React.useState("...")
	const [newAppVer, setNewAppVer] = React.useState(null)
	const [showUpdatePopup, setShowUpdatePopup] = React.useState(false)
	const [ytDlp, setYtDlp] = React.useState("...")
	const [SETTINGS, setSETTINGS] = React.useState({})
	const [updateAvalible, setUpdateAvalible] = React.useState(false)
	const { setLanguage } = useApp()
	const { showToast } = useToast()
	React.useEffect(_=>{
		(async _=>{
			const SETTINGS = await eel.request_settings()()
			setSETTINGS(SETTINGS)
			if (SETTINGS.check_updates){
				const avaliable = await eel.check_updates()()
				if (avaliable){
					setUpdateAvalible(true)
					setNewAppVer(avaliable.new)
					setShowUpdatePopup(true)
				}
			}
			if (SETTINGS.theme){
				applyTheme(SETTINGS.theme)
			}
			if (SETTINGS.language){
				setLanguage(SETTINGS.language)
			}
		})()
	}, [])
	React.useEffect(_=>{
		(async _=>{
			const app_ver = await eel.get_app_version()()
			setAppVer(app_ver)

			const yt_dlp_ver = await eel.get_yt_dlp_version()()
			if (yt_dlp_ver){
				setYtDlp(yt_dlp_ver)
				onReady()
				const SETTINGS = await eel.request_settings()()
				if (SETTINGS.check_updates){
					const fail = await eel.check_ytdlp_updates()()
					if (fail.length == 0){
						const new_version = await eel.get_yt_dlp_version()()
						if (yt_dlp_ver != new_version){
							showToast({text: <LANG id="yt_dlp_updated" vars={{ver: new_version}} html={true}/>, type: "success"})
						}
					}
				}
			} else {
				const fail = await eel.check_ytdlp_updates()()
				if (fail.length > 0){
					if (fail.includes("no_yt-dlp") && fail.includes("PermissionError")){
						setErrorMsg(<LANG id="PermissionError"/>)
						setShowReload(true)
					}
					else if (fail.includes("no_yt-dlp")){
						setErrorMsg(<LANG id="InternetError"/>)
						setShowReload(true)
					}
					else if (fail.includes("PermissionError")){
						setErrorMsg(<LANG id="PermissionError"/>)
					}
				} else {
					const new_version = await eel.get_yt_dlp_version()()
					if (new_version){
						setYtDlp(new_version)
						onReady()
					}
				}
			}
		})()
	}, [])

	const changeSetting = async event=>{
		const name = event.target.name
		const value = event.target.type == "checkbox" ? event.target.checked : event.target.value
		if (name == "theme"){
			applyTheme(value)
		}
		else if (name == "language"){
			setLanguage(value)
		}
		setSETTINGS(prev => ({
			...prev,
			[name]: value
		}))
		await eel.change_setting(name, value)()
	}
	const requestOutputFolder = async _=>{
		const answ = await eel.request_folder()()
		if (answ){
			await eel.change_setting("output_folder", answ)()
			setSETTINGS(prev => ({
				...prev,
				["output_folder"]: answ
			}))
		}
	}
	return (
		<React.Fragment>
		<Popup id="settings" show={show} setShow={setShow}>
			<div className="content">
				<h3 className="versions">
					<span><LANG id="version"/>:</span>
					<span className="version">{appVer}</span>
					<a id="update_avalible" className={updateAvalible ? "show" : ""}
						href="https://github.com/SuperZombi/MyTube-GUI/releases" target="_blank">
						<i className="fa-solid fa-circle-up"></i>
					</a>
				</h3>
				<h4 className="versions">
					<span>yt-dlp:</span>
					<span className="version">{ytDlp}</span>
				</h4>
				<div className="grid">
					<i className="fa-solid fa-circle-up"></i>
					<span><LANG id="check_updates"/></span>
					<input type="checkbox" name="check_updates"
						checked={SETTINGS?.check_updates || false}
						onChange={changeSetting}
					/>

					<div className="line"></div>
				
					<i className="fa-solid fa-brush"></i>
					<span><LANG id="theme"/></span>
					<select name="theme"
						value={SETTINGS?.theme}
						onChange={changeSetting}
					>
						<option value="auto"><LANG id="theme_auto"/></option>
						<option value="light"><LANG id="theme_light"/></option>
						<option value="dark"><LANG id="theme_dark"/></option>
					</select>

					<i className="fa-solid fa-globe"></i>
					<span><LANG id="language"/></span>
					<select name="language"
						value={SETTINGS?.language}
						onChange={changeSetting}
					>
						<option value="en">English</option>
						<option value="ru">Русский</option>
						<option value="uk">Українська</option>
					</select>

					<div className="line"></div>
				
					<i className="fa-solid fa-video"></i>
					<span><LANG id="video_quality"/></span>
					<select name="video_quality"
						value={SETTINGS?.video_quality}
						onChange={changeSetting}
					>
						<option value="max"><LANG id="video_quality_best"/></option>
						<option value="1080">1080p</option>
						<option value="720">720p</option>
					</select>
				
					<i className="fa-solid fa-folder"></i>
					<span><LANG id="output_folder"/></span>
					<div className="row">
						<input type="text" name="output_folder" readOnly
							value={SETTINGS?.output_folder || ""}
						/>
						<button className="tiny-button" id="output_folder"
							onClick={requestOutputFolder}
						>
							<i className="fa-solid fa-folder"></i>
						</button>
					</div>
				</div>
			</div>
		</Popup>
		<Popup id="new-version-popup" show={showUpdatePopup} setShow={_=>setShowUpdatePopup(false)}>
			<div className="content">
				<div className="update-icon"><i className="fa-solid fa-circle-up"></i></div>
				<span><LANG id="update_avalible"/></span>
				<div className="versions">
					<span className="version">{appVer}</span>
					<span>⮕</span>
					<span className="version">{newAppVer}</span>
				</div>
				<a className="simple-button" href="https://github.com/SuperZombi/MyTube-GUI/releases" target="_blank">
					<LANG id="download_button"/>
				</a>
			</div>
		</Popup>
		</React.Fragment>
	)
}
