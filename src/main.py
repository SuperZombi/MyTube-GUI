import eel
import sys, os
import MyTube
import asyncio
import uuid
import re
import subprocess
from threading import Thread

__version__ = "0.0.1"


# ---- Required Functions ----
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

def raiseError(msg):
	eel.displayError(strip_ansi_codes(msg))

@eel.expose
def get_app_version():
	return __version__


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


CACHED_QUERIES = {}
def get_yt_obj(url):
	obj = CACHED_QUERIES.get(url, None)
	if not obj:
		obj = MyTube.YouTube(url)
		CACHED_QUERIES[url] = obj
	return obj


@eel.expose
def get_vid_info(url):
	try:
		yt = get_yt_obj(url)
		return {
			"title": yt.title,
			"author": yt.author,
			"thumb": yt.thumbnail.url,
			"type": yt.type,
			"streams": {
				"video": streams_to_list(yt.streams.filter(only_video=True, no_muxed=True).order_by("res", "fps")),
				"audio": streams_to_list(yt.streams.filter(only_audio=True).order_by("abr"))
			}
		}
	except Exception as e:
		raiseError(str(e))



class ProgressMyTube:
	def __init__(self, downloader_id):
		self.id = downloader_id
	async def __call__(self, current, total):
		eel.download_progress(self.id, current, total)


DOWNLOADERS = {}
@eel.expose
def download(downloader_id):
	downloader = DOWNLOADERS[downloader_id]
	downloader.FFMPEG = resource_path("ffmpeg.exe")
	def handler():
		try:
			asyncio.run(downloader(
				"downloads", on_progress=ProgressMyTube(downloader_id),
				on_success=lambda f: eel.finish_download(downloader_id, f),
				on_abort=lambda:eel.abort_download(downloader_id)
			))
		except Exception as e:
			raiseError(str(e))

	Thread(target=handler, daemon=True).start()


@eel.expose
def get_downloader_process(url, streams, metadata):
	yt = get_yt_obj(url)
	video = None
	audio = None
	if streams.get('video'):
		video = yt.streams.get(streams['video'])
	if streams.get('audio'):
		audio = yt.streams.get(streams['audio'])
	
	new_metadata = yt.metadata
	new_metadata.update(metadata)

	downloader = yt.download(video=video, audio=audio, metadata=new_metadata)
	id = uuid.uuid4().hex
	DOWNLOADERS[id] = downloader
	return {
		"id": id,
		"title": new_metadata.get("title"),
		"author": new_metadata.get("author"),
		"thumb": yt.thumbnail.url,
		"time": strtime(yt.duration)
	}

@eel.expose
def abort_download(downloader_id):
	downloader = DOWNLOADERS.get(downloader_id)
	if downloader: downloader.abort()

@eel.expose
def open_output_file(file):
	subprocess.run(["explorer", '/select,', file])


eel.init(resource_path("web"))
eel.start("index.html", port=0)
