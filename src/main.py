import eel
import sys, os
import MyTube
import asyncio
import uuid
import json
import subprocess
from threading import Thread
from utils import *


__version__ = "0.0.3"
@eel.expose
def get_app_version(): return __version__


def raiseError(msg):
	eel.displayError(strip_ansi_codes(msg))


COOKIES_FILE = "cookies.json"
COOKIES_DATA = None
def get_cookies():
	global COOKIES_DATA
	if not COOKIES_DATA:
		if os.path.exists(COOKIES_FILE):
			with open(COOKIES_FILE, 'r') as f:
				COOKIES_DATA = json.loads(f.read())
	return COOKIES_DATA


CACHED_QUERIES = {}
def get_yt_obj(url):
	obj = CACHED_QUERIES.get(url, None)
	if not obj:
		obj = MyTube.YouTube(url, cookies=get_cookies())
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


@eel.expose
def is_user_logined():
	return os.path.exists(COOKIES_FILE)
@eel.expose
def logout_user():
	if os.path.exists(COOKIES_FILE): os.remove(COOKIES_FILE)
@eel.expose
def login_user():
	try:
		cookies = get_user_cookies()
		if cookies:
			with open(COOKIES_FILE, 'w') as f:
				f.write(json.dumps(cookies))
			return True
	except:
		None


eel.init(resource_path("web"))
eel.start("index.html", port=0)
