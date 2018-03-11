var storage = {
	MODE: 1,

	Name: function () {
		return "Local storage";
	},

	Link: function () {
		return { text: '', href: '' };
	},
	SetLink: function (link) {
	},

	ByteArrayToString: function (a) {
		var s = '';
		for (var i = 0; i < a.length; i++) {
			s += String.fromCharCode(a[i]);
		}
		return s;
	},

	StringToByteArray: function (s) {
		var a = [];
		for (var i = 0; i < s.length; i++) {
			a.push(s.charCodeAt(i))
		}
		return a;
	},

	Quota: function () {
		var MAX = 'unknown';
		var st = window.localStorage.getItem('files') || 0;
		st += window.localStorage.getItem('compressed') || 0;

		if (!st || !st.length) return '0 byte / ' + MAX;
		if (st.length < 2048) {
			return st.length * 2 + ' byte / ' + MAX;
		}
		return Math.ceil(st.length * 2 / 1024) + ' KiB / ' + MAX;
	},


	getfiles: function (cb) {
		var st = window.localStorage.getItem('compressed');
		if (!st) {
			st = window.localStorage.getItem('files')
			if (!st)
				cb([]);
			else
				cb(JSON.parse(st));
		} else {
			LZMA.decompress(this.StringToByteArray(st), function (result, error) {
				if (error) {
					cb([]);
					Snack('Problems with decompression');
					console.log(error);
				} else {
					cb(JSON.parse(result));
				}
			})
		}
	},
	GetFileList: function (cb) {
		this.getfiles(function (st) {
			var li = [];
			for (var i = 0; i < st.length; i++) {
				li.push(st[i].name);
			}
			cb(li);
		})
	},

	PurgeFiles: function () {
		window.localStorage.setItem('files', '')
		window.localStorage.setItem('compressed', '')
	},

	SaveFile: function (name, content) {
		this.getfiles(function (st) {
			var saved = false;
			for (var i = 0; i < st.length; i++) {
				if (name == st[i].name) {
					saved = true;
					st[i].content = content;
					break;
				}
			}
			if (!saved) {
				st.push({
					name: name,
					content: content,
				})
			}
			LZMA.compress(JSON.stringify(st), this.MODE, function (result, error) {
				if (!error) {
					window.localStorage.setItem('compressed', storage.ByteArrayToString(result));
					console.log(result);
				} else {
					Snack('Could not save');
				}
			})
		});
	},

	LoadFile: function (name, cb) {
		this.getfiles(function (st) {
			if (!st || !st.length) return undefined;
			for (var i = 0; i < st.length; i++) {
				if (name == st[i].name) {
					cb(st[i].content);
				}
			}
			cb(undefined);
		})
	},

	OpenFile: function (params) {
		var name = ParamFilename(params);
		if (!name) {
			openedFile = undefined;
			editor.doc.setValue('');
			if (name && typeof (name) == 'string') {
				openedFile = name;
				document.title = 'Vim';
				window.location.hash = '#' + openedFile;
				Snack('Created new file "' + name + '"');
			}
		}
		this.LoadFile(name, function (text) {
			if (text) {
				editor.doc.setValue(text);
				openedFile = name;
				document.title = 'Vim - ' + openedFile;
				window.location.hash = '#' + openedFile;
			}
		})
	},

	WriteFile: function (params) {
		var name = ParamFilename(params);
		if (!name && openedFile) {
			name = openedFile;
		}
		if (name) {
			var text = this.SaveFile(name, editor.doc.getValue());
			openedFile = name;
			window.location.hash = '#' + openedFile;
			document.title = 'Vim - ' + openedFile;
			Snack('Saving to "' + openedFile + '"');
			return true;
		}
		Snack('File was not saved!');
		return false;
	}

}
