import sys, os
import requests
import re
import time
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import comtypes.client as cc
from win32gui import GetForegroundWindow
from pythoncom import CoInitialize
cc.GetModule("./TaskbarLib.tlb")
import comtypes.gen.TaskbarLib as tbl


class Version:
	def __init__(self, version:str):
		self.version_str = version
		self.version_arr = version.split('.')
		self.version_value = int("".join(self.version_arr))
	def __str__(self):return self.version_str
	def __repr__(self):return str(self)
	def __lt__(self, other): return self.version_value < other
	def __gt__(self, other): return self.version_value > other


class Progress:
	def __init__(self):
		self.window_handle = GetForegroundWindow()
		CoInitialize()
		self.taskbar = cc.CreateObject(
			"{56FDF344-FD6D-11d0-958A-006097C9A090}",
			interface=tbl.ITaskbarList3)
		self.taskbar.ActivateTab(self.window_handle)
		self.taskbar.HrInit()

	def set_progress(self, value: int, max: int = 100):
		self.taskbar.setProgressValue(self.window_handle, value, max)

	def reset(self):
		self.taskbar.SetProgressState(self.window_handle, 0)
		self.set_progress(0)


def resource_path(relative_path):
	""" Get absolute path to resource, works for dev and for PyInstaller """
	base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	return os.path.join(base_path, relative_path)

def get_downloads_folder():
	downloads = os.path.join(os.path.expanduser("~"), "Downloads")
	if os.path.exists(downloads): return downloads
	return os.path.join(os.getcwd(), "downloads")

def local():
	try:
		with open('test.tmp', 'w') as f:
			f.write('test')
		os.remove('test.tmp')
		return os.getcwd()
	except IOError:
		data_dir = os.path.join(os.getenv('APPDATA'), 'MyTube')
		os.makedirs(data_dir, exist_ok=True)
		return data_dir

def strtime(seconds):
	hours = seconds // 3600
	minutes = (seconds % 3600) // 60
	seconds = seconds % 60
	string = ""
	if hours > 0: string += f"{hours:02}:"
	string += f"{minutes:02}:{seconds:02}"
	return string

def strip_ansi(text):
	ansi_escape = re.compile(r'\x1B[@-_][0-?]*[ -/]*[@-~]')
	return ansi_escape.sub('', text)

def stream_to_json(stream):
	data = {"itag": stream.itag, "filesize": stream.filesize}
	data["quality"] = stream.abr if stream.isAudio else stream.res
	data["codec"] = stream.audioCodec.split(".")[0] if stream.isAudio else stream.videoCodec.split(".")[0]
	data["extension"] = stream.audioExt if stream.isAudio else stream.videoExt
	if stream.isVideo or stream.isMuxed or stream.isM3U8:
		data["fps"] = stream.fps
	if stream.isAudio or stream.isMuxed or stream.isM3U8:
		data["lang"] = stream.lang
	return data

def streams_to_list(streams):
	return [stream_to_json(stream) for stream in streams]

def login_to_youtube():
	driver = uc.Chrome()
	driver.set_window_size(620,720)
	driver.get("https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fwww.youtube.com")

	while True:
		time.sleep(1)
		try:
			if driver.current_url == "https://www.youtube.com/":
				break
		except:
			return

	cookies = driver.get_cookies()

	avatar_btn = driver.find_element(By.ID, "avatar-btn")
	avatar_btn.click()
	avatar_img = avatar_btn.find_element(By.TAG_NAME, "img")
	avatar_url = avatar_img.get_attribute("src")

	wait = WebDriverWait(driver, 5)
	account_name_el = wait.until(
		EC.visibility_of_element_located((By.ID, "account-name"))
	)
	account_name = account_name_el.text
	driver.quit()

	return {
		"name": account_name,
		"avatar": avatar_url,
		"cookies": cookies
	}

def download_file(url, filename, chunk_size=8192):
	with requests.get(url, stream=True) as r:
		r.raise_for_status()
		with open(filename, "wb") as f:
			for chunk in r.iter_content(chunk_size):
				f.write(chunk)

def get_remote_version():
	try:
		r = requests.get('https://api.github.com/repos/SuperZombi/MyTube-GUI/releases/latest')
		if r.ok: return Version(r.json()['tag_name'])
	except Exception as e:
		print("[Failed to check app updates]")
		print(e)
		print("---------")
	return Version("0")

def get_remote_ytdlp():
	try:
		r = requests.get("https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest")
		if r.ok:
			data = r.json()
			ver = data['tag_name']
			assets = data.get("assets")
			target_asset = next((d for d in assets if d.get("name") == "yt-dlp.exe"), None)
			target_url = target_asset.get("browser_download_url")
			return {
				"version": ver,
				"url": target_url
			}
		else:
			print(r.text)
	except Exception as e:
		print("[Failed to check yt-dlp updates]")
		print(e)
		print("---------")


def check_ytdlp(local_dlp):
	errors = []
	remote_dlp = get_remote_ytdlp()
	if remote_dlp:
		local_dlp_ver = Version(local_dlp) if local_dlp else Version("0")
		remote_dlp_ver = Version(remote_dlp["version"])
		if remote_dlp_ver > local_dlp_ver:
			print(f"Current yt-dlp version: {local_dlp_ver}")
			print(f"Downloading yt-dlp {remote_dlp_ver}")
			ytdlp_path = os.path.join(os.getcwd(), "yt-dlp.exe")
			try:
				download_file(remote_dlp["url"], ytdlp_path)
			except PermissionError:
				print("[Failed to download yt-dlp]")
				print("[PermissionError] Run the program as administrator")
				errors.append("PermissionError")
				if not local_dlp: errors.append("no_yt-dlp")
			except Exception as e:
				print("[Failed to download yt-dlp]")
				print(e)
				print("---------")
				if not local_dlp: errors.append("no_yt-dlp")
	else:
		if not local_dlp: errors.append("no_yt-dlp")
	return errors
