const Settings = ({
	show, setShow, onReady
}) => {
	const [appVer, setAppVer] = React.useState("...")
	const [ytDlp, setYtDlp] = React.useState("...")
	const [SETTINGS, setSETTINGS] = React.useState(null)
	const [settingsLoaded, setSettingsLoaded] = React.useState(false)
	React.useEffect(_=>{
		(async _=>{
			const app_ver = await eel.get_app_version()()
			setAppVer(app_ver)

			const yt_dlp_ver = await eel.get_yt_dlp_version()()
			if (yt_dlp_ver){
				setYtDlp(yt_dlp_ver)
				onReady()
			} else {
				console.error("YT-DLP not found")
			}
			// if (SETTINGS.check_updates){
			// 	check_updates()
			// 	check_ytdlp_updates(yt_dlp_ver)
			// } else {
			// 	if (!yt_dlp_ver){
			// 		check_ytdlp_updates(yt_dlp_ver)
			// 	}
			// }
		})()
	}, [])
	React.useEffect(_=>{
		(async _=>{
			if (!settingsLoaded){
				const SETTINGS = await eel.request_settings()()
				setSETTINGS(SETTINGS)
				setSettingsLoaded(true)
			}
		})()
	}, [settingsLoaded])

	const changeSetting = async event=>{
		const name = event.target.name
		const value = event.target.type == "checkbox" ? event.target.checked : event.target.value
		if (name == "theme"){
			applyTheme(value)
		}
		else if (name == "language"){

		}
		await eel.change_setting(name, value)()
		setSettingsLoaded(false)
	}
	const requestOutputFolder = async _=>{
		const answ = await eel.request_folder()()
		if (answ){
			await eel.change_setting("output_folder", answ)()
			setSettingsLoaded(false)
		}
	}
	return (
		<Popup id="settings" show={show} setShow={setShow}>
			<div className="content">
				<h3>
					<span lang_="version">Version</span>:
					<span className="version" id="app_version">{appVer}</span>
					<a id="update_avalible" href="https://github.com/SuperZombi/MyTube-GUI/releases" target="_blank"><i className="fa-solid fa-circle-up"></i></a>
				</h3>
				<h4>
					<span>yt-dlp</span>:
					<span className="version" id="yt_dlp_version">{ytDlp}</span>
				</h4>
				<div className="grid">
					<i className="fa-solid fa-circle-up"></i>
					<span lang_="check_updates">Check updates</span>
					<input type="checkbox" name="check_updates"
						checked={SETTINGS?.check_updates || false}
						onChange={changeSetting}
					/>

					<div className="line"></div>
				
					<i className="fa-solid fa-brush"></i>
					<span lang_="theme">Theme</span>
					<select name="theme"
						value={SETTINGS?.theme}
						onChange={changeSetting}
					>
						<option value="auto" lang_="theme_auto">Auto</option>
						<option value="light" lang_="theme_light">Light</option>
						<option value="dark" lang_="theme_dark">Dark</option>
					</select>

					<i className="fa-solid fa-globe"></i>
					<span lang_="language">Language</span>
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
					<span lang_="video_quality">Video quality</span>
					<select name="video_quality"
						value={SETTINGS?.video_quality}
						onChange={changeSetting}
					>
						<option value="max">Best</option>
						<option value="1080">1080p</option>
						<option value="720">720p</option>
					</select>
				
					<i className="fa-solid fa-folder"></i>
					<span lang_="output_folder">Output Folder</span>
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
	)
}
