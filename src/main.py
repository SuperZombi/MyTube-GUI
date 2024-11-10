import eel
import time
import sys, os
import MyTube
import asyncio
import uuid


# ---- Required Functions ----
def resource_path(relative_path):
	""" Get absolute path to resource, works for dev and for PyInstaller """
	base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	return os.path.join(base_path, relative_path)


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
@eel.expose
def get_vid_info(url):
	if CACHED_QUERIES.get(url):
		yt = CACHED_QUERIES[url]
	else:
		yt = MyTube.YouTube(url)
		CACHED_QUERIES[url] = yt
	data = {
		"name": yt.title,
		"author": yt.author,
		"thumb": yt.thumbnail.url,
		"streams": {
			"video": streams_to_list(yt.streams.filter(only_video=True, no_muxed=True).order_by("res", "fps")),
			"audio": streams_to_list(yt.streams.filter(only_audio=True).order_by("abr"))
		}
	}
	return data



class ProgressMyTube:
	def __init__(self, downloader_id):
		self.id = downloader_id
	async def __call__(self, current, total):
		eel.download_progress(self.id, current, total)


DOWNLOADERS = {}
async def download_async(downloader_id):
	downloader = DOWNLOADERS[downloader_id]
	file = await downloader("downloads", on_progress=ProgressMyTube(downloader_id))

@eel.expose
def download(downloader_id):
	return asyncio.run(download_async(downloader_id))


@eel.expose
def get_downloader_process(url, streams, metadata):
	yt = CACHED_QUERIES[url]
	video = None
	audio = None
	if streams.get('video'):
		video = yt.streams.get(streams['video'])
	if streams.get('audio'):
		audio = yt.streams.get(streams['audio'])
	
	new_metadata = yt.metadata
	new_metadata.update(metadata)

	downloader = yt.download(video=video, audio=audio)
	id = uuid.uuid4().hex
	DOWNLOADERS[id] = downloader
	return id

@eel.expose
def abort(downloader_id):
	downloader = DOWNLOADERS.get(downloader_id)
	if downloader:
		downloader.abort()


eel.init(resource_path("web"))
eel.start("index.html", port=0)
