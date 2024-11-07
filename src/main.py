import eel
import time
import sys, os
import MyTube


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



eel.init(resource_path("web"))
eel.start("index.html", port=0)
