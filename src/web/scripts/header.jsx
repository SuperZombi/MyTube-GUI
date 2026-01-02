const Header = ({
	setShowSettings
}) => {
	const [showAccount, setShowAccount] = React.useState(false)
	const [loginDisabled, setLoginDisabled] = React.useState(false)
	const [activeUser, setActiveUser] = React.useState(null)
	const [users, setUsers] = React.useState([])
	const [usersLoaded, setUsersLoader] = React.useState(false)

	React.useEffect(_=>{
		const handler = e=>{
			if (!(e.target.closest(".account_menu") || e.target.closest(".profile-button"))){
				setShowAccount(false)
			}
		}
		window.addEventListener("click", handler, true)
		return _=>{
			window.removeEventListener("click", handler, true)
		}
	}, [])

	React.useEffect(_=>{
		(async _=> {
			if (!usersLoaded){
				const result = await eel.get_users()()
				const active = result.users.find(
					user => user.id === result.active
				)
				setActiveUser(active)
				setUsers(result.users)
				setUsersLoader(true)
			}
		})()
	}, [usersLoaded])

	const onLogin = async _=>{
		setLoginDisabled(true)
		let result = await eel.login_user()()
		if (result){
			console.log("Login ok")
			setUsersLoader(false)
		}
		setLoginDisabled(false)
	}
	const onLogOut = async _=>{
		if (confirm("Log out?")){
			await eel.logout_user(activeUser.id)()
			setUsersLoader(false)
		}
	}
	const changeUser = async id=>{
		await eel.set_active_user(id)()
		setUsersLoader(false)
	}

	return (
		<div className="header">
			<a className="logo" href="https://github.com/SuperZombi/MyTube-GUI" target="_blank" draggable={false}>
				<img src="images/icon.png" draggable={false}/>
				<span>MyTube</span>
			</a>
			<div className="right-header">
				<div className="profile-button" onClick={_=>setShowAccount(prev=>!prev)}>
					<img id="active-user" src={activeUser?.avatar} draggable={false}/>
					<i className="fa-solid fa-circle-user"></i>
				</div>
				<div className="settings-button" onClick={_=>setShowSettings(true)}>
					<i className="fa-solid fa-gear"></i>
				</div>
			</div>
			<div className={`account_menu ${showAccount ? "open" : ""}`}>
				<button className="simple-button" disabled={loginDisabled} onClick={onLogin}>
					<i className="fa-solid fa-right-to-bracket"></i>
					<span lang_="account_signin">Add account</span>
				</button>
				{activeUser ? (
					<button className="simple-button danger" onClick={onLogOut}>
						<i className="fa-solid fa-right-from-bracket"></i>
						<span lang_="account_signout">Sign out</span>
					</button>
				) : null}
				<div id="users-list">
					{activeUser ? (
						<button className="simple-button gray"
							onClick={_=>changeUser(null)}
						>
							<i className="fa-solid fa-circle-user"></i>
							<span>Guest</span>
						</button>
					) : null}
					{users.filter(u=>u.id!==activeUser?.id).map(user=>(
						<button className="simple-button gray" key={user.id}
							onClick={_=>changeUser(user.id)}
						>
							<img src={user.avatar} draggable={false}/>
							<span>{user.name}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}
