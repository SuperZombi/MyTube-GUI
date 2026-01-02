const Settings = ({
	show, setShow
}) => {
	return (
		<Popup id="settings" show={show} setShow={setShow}>
			<div className="content">
				<h3>
					<span lang_="version">Version</span>:
					<span className="version" id="app_version"></span>
					<a id="update_avalible" href="https://github.com/SuperZombi/MyTube-GUI/releases" target="_blank"><i className="fa-solid fa-circle-up"></i></a>
				</h3>
				<h4>
					<span>yt-dlp</span>:
					<span className="version" id="yt_dlp_version">...</span>
				</h4>
				<div className="grid">
					<i className="fa-solid fa-circle-up"></i>
					<span lang_="check_updates">Check updates</span>
					<input type="checkbox" name="check_updates"/>

					<div className="line"></div>
				
					<i className="fa-solid fa-brush"></i>
					<span lang_="theme">Theme</span>
					<select name="theme">
						<option value="auto" lang_="theme_auto">Auto</option>
						<option value="light" lang_="theme_light">Light</option>
						<option value="dark" lang_="theme_dark">Dark</option>
					</select>

					<i className="fa-solid fa-globe"></i>
					<span lang_="language">Language</span>
					<select name="language">
						<option value="en">English</option>
						<option value="ru">Русский</option>
						<option value="uk">Українська</option>
					</select>

					<div className="line"></div>
				
					<i className="fa-solid fa-video"></i>
					<span lang_="video_quality">Video quality</span>
					<select name="video_quality">
						<option value="max">Best</option>
						<option value="1080">1080p</option>
						<option value="720">720p</option>
					</select>
				
					<i className="fa-solid fa-folder"></i>
					<span lang_="output_folder">Output Folder</span>
					<div className="row">
						<input type="text" name="output_folder" readOnly/>
						<button className="tiny-button" id="output_folder" lang_title="select"><i className="fa-solid fa-folder"></i></button>
					</div>
				</div>
			</div>
		</Popup>
	)
}
