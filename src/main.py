import eel
import sys, os
import MyTube
import asyncio
import uuid
import json
import subprocess
import requests
from tkinter import Tk
from tkinter.filedialog import askdirectory
from threading import Thread
from utils import *
import traceback


__version__ = "0.7.6"
@eel.expose
def get_app_version(): return __version__

APPDATA = local()
SETTINGS_FILE = os.path.join(APPDATA, "app.settings.json")
SETTINGS = {
	"output_folder": get_downloads_folder(),
	"theme": "auto",
	"language": "en"
}
@eel.expose
def request_settings(): return SETTINGS
def load_settings():
	if os.path.exists(SETTINGS_FILE):
		with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
			loaded = json.loads(f.read())
			SETTINGS.update(loaded)
@eel.expose
def change_setting(name, value):
	SETTINGS.update({name: value})
	with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
		f.write(json.dumps(SETTINGS, indent=4, ensure_ascii=False))
load_settings()

@eel.expose
def get_lang_data(lang_code):
	lang_file = resource_path(os.path.join("locales", lang_code+".json"))
	if os.path.exists(lang_file):
		with open(lang_file, 'r', encoding='utf-8') as f:
			return json.loads(f.read())


@eel.expose
def check_updates():
	r = requests.get('https://api.github.com/repos/SuperZombi/MyTube-GUI/releases/latest')
	if r.ok:
		remote_version = Version(r.json()['tag_name'])
		current_version = Version(__version__)
		if remote_version > current_version: return True


@eel.expose
def request_folder():
	root = Tk()
	root.withdraw()
	root.wm_attributes('-topmost', 1)
	folder = askdirectory(parent=root)
	return folder


def raiseError(msg, traceback=""):
	eel.displayError(
		strip_ansi(str(msg)),
		strip_ansi(str(traceback))
	)


COOKIES_FILE = os.path.join(APPDATA, "cookies.json")
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
	if "playlist" in url: return raiseError("Playlists are not supported!")
	try:
		yt = get_yt_obj(url)
		video_streams = yt.streams.filter(only_video=True, no_muxed=True).order_by("res", "fps")
		audio_streams = yt.streams.filter(only_audio=True).order_by("abr")

		def filter_streams(streams, kwargs):
			temp = streams.filter(**kwargs)
			return temp if len(temp) > 0 else streams

		temp_videos = video_streams
		if SETTINGS.get("video_quality", "").isnumeric():
			prefer_q = int(SETTINGS.get("video_quality"))
			temp_videos = filter_streams(temp_videos, {"max_res": prefer_q})

		return {
			"title": yt.title,
			"author": yt.author,
			"thumb": yt.thumbnail.url,
			"type": yt.type,
			"streams": {
				"video": streams_to_list(video_streams),
				"audio": streams_to_list(audio_streams)
			},
			"select": {
				"video": stream_to_json(temp_videos.first())
			}
		}
	except Exception as e:
		raiseError(e, traceback.format_exc())


class ProgressMyTube:
	def __init__(self, downloader_id):
		self.id = downloader_id
	async def __call__(self, current, total):
		eel.download_progress(self.id, current, total)

class FFmpegProgress:
	def __init__(self, downloader_id):
		self.id = downloader_id
	async def __call__(self, current, total):
		eel.ffmpeg_progress(self.id, current, total)


DOWNLOADERS = {}
@eel.expose
def download(downloader_id):
	downloader = DOWNLOADERS[downloader_id]
	downloader.FFMPEG = resource_path("ffmpeg.exe")
	def handler():
		try:
			asyncio.run(downloader(
				SETTINGS.get("output_folder"),
				on_progress=ProgressMyTube(downloader_id),
				ffmpeg_progress=FFmpegProgress(downloader_id),
				on_success=lambda f: eel.finish_download(downloader_id, f),
				on_abort=lambda:eel.abort_download(downloader_id)
			))
		except Exception as e:
			raiseError(e, traceback.format_exc())

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


def run():
	for browser in ['chrome', 'edge', 'default']:
		try:
			eel.start("index.html", mode=browser, port=8090)
			return
		except Exception: None

if __name__ == "__main__":
	eel.init(resource_path("web"))
	run()
