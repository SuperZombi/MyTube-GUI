import sys, os
import re
import time
import undetected_chromedriver as uc


class Version:
	def __init__(self, version:str):
		self.version_str = version
		self.version_arr = version.split('.')
		self.version_value = int("".join(self.version_arr))
	def __str__(self):return self.version_str
	def __repr__(self):return str(self)
	def __lt__(self, other): return self.version_value < other
	def __gt__(self, other): return self.version_value > other


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

def get_user_cookies():
	driver = uc.Chrome()
	driver.set_window_size(620,720)
	driver.get("https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fwww.youtube.com")

	while True:
		time.sleep(1)
		if driver.current_url == "https://www.youtube.com/":
			break

	cookies = driver.get_cookies()
	driver.quit()
	return cookies
