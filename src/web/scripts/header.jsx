const Header = ({
	setShowSettings
}) => {
	return (
		<div className="header">
			<a className="logo" href="https://github.com/SuperZombi/MyTube-GUI" target="_blank" draggable={false}>
				<img src="images/icon.png" draggable={false}/>
				<span>MyTube</span>
			</a>
			<div className="right-header">
				<div className="profile-button">
					<img id="active-user" draggable={false}/>
					<i className="fa-solid fa-circle-user"></i>
				</div>
				<div className="settings-button" onClick={_=>setShowSettings(true)}>
					<i className="fa-solid fa-gear"></i>
				</div>
			</div>
			<div className="account_menu">
				<button className="simple-button" id="login_button">
					<i className="fa-solid fa-right-to-bracket"></i>
					<span lang_="account_signin">Add account</span>
				</button>
				<button className="simple-button danger" id="logout_button">
					<i className="fa-solid fa-right-from-bracket"></i>
					<span lang_="account_signout">Sign out</span>
				</button>
				<div id="users-list"></div>
			</div>
		</div>
	)
}
