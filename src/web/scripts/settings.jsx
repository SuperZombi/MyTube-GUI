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
	const { language, setLanguage } = useApp()
	const { showToast } = useToast()
	React.useEffect(_=>{
		(async _=>{
			const SETTINGS = await eel.request_settings()()
			setSETTINGS(SETTINGS)
			if (SETTINGS.check_updates){
				check_for_updates()
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
		(_=>{
			eel.get_app_version()().then(app_ver=>{
				setAppVer(app_ver)
			})
			eel.get_yt_dlp_version()().then(yt_dlp_ver=>{
				if (yt_dlp_ver){
					setYtDlp(yt_dlp_ver)
					onReady(true)
				} else {
					download_ytdlp(_=>{
						onReady(true)
					}, errors=>{
						setShowReload(true)
						if (errors.includes("PermissionError")){
							setErrorMsg(<LANG id="PermissionError" html={true}/>)
						}
						else{
							setErrorMsg(<LANG id="InternetError" html={true}/>)
						}
					})
				}
			})
		})()
	}, [])

	const check_for_updates = _=>{
		let not_found = {
			app: false,
			yt_dlp: false
		}
		const check_toast = _=>{
			if (not_found["app"] && not_found["yt_dlp"]){
				showToast({text: <LANG id="updates_not_found_toast"/>})
			}
		}

		showToast({text: <LANG id="checking_updates_toast"/>})
		eel.check_updates()().then(avaliable=>{
			if (avaliable){
				setUpdateAvalible(true)
				setNewAppVer(avaliable.new)
				setShowUpdatePopup(true)
			} else {
				not_found["app"] = true
				check_toast()
			}
		})
		eel.check_ytdlp_updates()().then(avaliable=>{
			if (avaliable){
				download_ytdlp(_=>{}, errors=>{
					if (errors.includes("PermissionError")){
						setErrorMsg(<LANG id="PermissionErrorUpdate" html={true}/>)
					}
					else{
						setErrorMsg(<LANG id="InternetError" html={true}/>)
					}
				})
			} else {
				not_found["yt_dlp"] = true
				check_toast()
			}
		})
	}
	const download_ytdlp = (on_success, on_error)=>{
		showToast({text: <LANG id="downloading_yt_dlp"/>})
		eel.download_ytdlp()().then(([result, errors])=>{
			if (result){
				eel.get_yt_dlp_version()().then(new_version=>{
					if (new_version){
						setYtDlp(new_version)
						showToast({text: <LANG id="yt_dlp_updated" vars={{ver: new_version}} html={true}/>, type: "success"})
						on_success()
					} else {
						on_error(errors)
					}
				})
			} else {
				on_error(errors)
			}
		})
	}

	const changeSetting = async event=>{
		const name = event.target.name
		const value = event.target.type == "checkbox" ? event.target.checked : event.target.value
		if (name == "theme"){
			applyTheme(value)
		}
		else if (name == "language"){
			setLanguage(value)
		}
		else if (name == "check_updates"){
			if (value){
				check_for_updates()
			}
		}
		setSETTINGS(prev => ({
			...prev,
			[name]: value
		}))
		await eel.change_setting(name, value)()

		if (name == "ytdlp_branch"){
			onReady(false)
			setYtDlp("...")
			download_ytdlp(_=>{
				onReady(true)
			}, errors=>{
				setShowReload(true)
				if (errors.includes("PermissionError")){
					setErrorMsg(<LANG id="PermissionError" html={true}/>)
				}
				else{
					setErrorMsg(<LANG id="InternetError" html={true}/>)
				}
			})
		}
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

					<i className="fa-solid fa-code-branch"></i>
					<span>yt-dlp channel</span>
					<select name="ytdlp_branch"
						value={SETTINGS?.ytdlp_branch}
						onChange={changeSetting}
					>
						<option value="stable">Stable</option>
						<option value="nightly">Experimental</option>
					</select>

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
						value={language}
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
