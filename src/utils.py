import sys, os
import re
import time
import undetected_chromedriver as uc
from comtypes.client import GetModule, CreateObject
import comtypes.gen.TaskbarLib as tbl
from win32gui import GetForegroundWindow
from pythoncom import CoInitialize
GetModule("./TaskbarLib.tlb")


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
		self.taskbar = CreateObject(
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
	if stream.isVideo:
		data["quality"] = stream.res
		data["extra"] = stream.fps
		data["codec"] = stream.videoCodec.split(".")[0]
		data["extension"] = stream.videoExt
	elif stream.isAudio:
		data["quality"] = stream.abr
		data["extra"] = stream.lang
		data["codec"] = stream.audioCodec.split(".")[0]
		data["extension"] = stream.audioExt
	return data

def streams_to_list(streams):
	return [stream_to_json(stream) for stream in streams]

def streams_to_dict(streams):
	return {lang_code: [stream_to_json(stream) for stream in streams[lang_code]] for lang_code in streams}

def get_user_cookies():
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
	driver.quit()
	return cookies
