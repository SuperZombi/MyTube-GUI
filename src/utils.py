import sys, os
import re
import time
import undetected_chromedriver as uc


def resource_path(relative_path):
	""" Get absolute path to resource, works for dev and for PyInstaller """
	base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	return os.path.join(base_path, relative_path)

def strtime(seconds):
	hours = seconds // 3600
	minutes = (seconds % 3600) // 60
	seconds = seconds % 60
	string = ""
	if hours > 0: string += f"{hours:02}:"
	string += f"{minutes:02}:{seconds:02}"
	return string

def strip_ansi_codes(text):
	ansi_escape = re.compile(r'\x1B[@-_][0-?]*[ -/]*[@-~]')
	return ansi_escape.sub('', text)

def streams_to_list(streams):
	output = []
	for stream in streams:
		data = {"itag": stream.itag, "filesize": stream.filesize}
		if stream.isVideo:
			data["quality"] = f"{stream.res}p"
			data["extra"] = f"{stream.fps}fps"
			data["codec"] = stream.videoCodec.split(".")[0]
			data["extension"] = stream.videoExt
		elif stream.isAudio:
			data["quality"] = f"{stream.abr}kbps"
			data["extra"] = stream.lang
			data["codec"] = stream.audioCodec.split(".")[0]
			data["extension"] = stream.audioExt
		output.append(data)
	return output

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
