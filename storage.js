
var openedFile = undefined

var snackTimeout = undefined
function Snack(str) {
	var x = document.getElementById("snackbar")
	x.className = "show";
	x.textContent = str;
	if (snackTimeout)
		window.clearTimeout(snackTimeout);
	snackTimeout = window.setTimeout(function () {
		x.className = x.className.replace("show", "");
	}, 5000);
}

function StorageQuota() {
	var MAX = 'unknown';
	var st = window.localStorage.getItem('files');
	if (!st || !st.length) return '0 byte / ' + MAX;
	if (st.length < 4096) {
		return st.length + ' byte / ' + MAX;
	}
	return (st.length / 1024) + ' KiB / ' + MAX;
}

function ShowExplorer() {
	document.getElementById('codeview').style.display = 'none';
	document.getElementById('explorer').style.display = 'block';
	var st = getfiles();
	if (!st || !st.length) return;
	var ul = document.getElementById('filelist');
	while (ul.firstChild) {
		ul.removeChild(ul.firstChild);
	}
	for (var i = 0; i < st.length; i++) {
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.href = '#';
		a.addEventListener('click', function (ev) {
			var filename = undefined;
			if (ev.srcElement.id != 'newfile')
				filename = ev.srcElement.textContent;
			ShowEditor(filename);
		});
		a.textContent = st[i].name;
		li.appendChild(a);
		ul.appendChild(li);
	}
	document.getElementById('quota').textContent = 'Used disk space: ' + StorageQuota();
}

function Focus() {
	var cm = document.getElementsByClassName('CodeMirror-sizer');
	if (!cm || cm.length < 1) return;
	cm[0].focus();
}

function ShowEditor(filename) {
	document.getElementById('codeview').style.display = 'block';
	document.getElementById('explorer').style.display = 'none';

	window.setTimeout(function () {
		OpenFile(filename);
		//Focus();
	}, 0)
}

function getfiles() {
	var st = window.localStorage.getItem('files');
	if (!st) {
		st = [];
	} else {
		st = JSON.parse(st);
		if (!st) {
			st = [];
		}
	}
	return st;
}
function PurgeFiles() {
	window.localStorage.setItem('files', '')
}

function SaveFile(name, content) {
	var st = getfiles();
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
	window.localStorage.setItem('files', JSON.stringify(st));
}

function LoadFile(name) {
	var st = getfiles();
	if (!st || !st.length) return undefined;
	for (var i = 0; i < st.length; i++) {
		if (name == st[i].name) {
			return st[i].content;
		}
	}
	return undefined;
}

function ParamFilename(params) {
	if (typeof (params) == 'string') return params;
	if (!params || !params.args || params.args.length < 1) return undefined;
	return params.args[0];
}

function OpenFile(params) {
	var name = ParamFilename(params);
	if (name) {
		var text = LoadFile(name);
		if (text) {
			editor.doc.setValue(text);
			openedFile = name;
			document.title = 'Vim - ' + openedFile;
			window.location.hash = '#' + openedFile;
			return true;
		}
	}
	openedFile = undefined;
	editor.doc.setValue('');
	if (name && typeof (name) == 'string') {
		openedFile = name;
		document.title = 'Vim';
		window.location.hash = '#' + openedFile;
		Snack('Created new file "' + name + '"');
	}
	return false;
}
function WriteFile(params) {
	var name = ParamFilename(params);
	if (!name && openedFile) {
		name = openedFile;
	}
	if (name) {
		var text = SaveFile(name, editor.doc.getValue());
		openedFile = name;
		window.location.hash = '#' + openedFile;
		document.title = 'Vim - ' + openedFile;
		Snack('Saved to "' + openedFile + '"');
		return true;
	}
	Snack('File was not saved!');
	return false;

}

CodeMirror.Vim.defineEx("open", "o", function (cm, params) {
	OpenFile(params);
})
CodeMirror.Vim.defineEx("write", "w", function (cm, params) {
	WriteFile(params);
})
CodeMirror.Vim.defineEx("quit", "q", function (cm, params) {
	ShowExplorer();
})
CodeMirror.Vim.defineEx("xxx", "x", function (cm, params) {
	WriteFile(params);
	ShowExplorer();
})
CodeMirror.Vim.defineEx("purge", "purge", function (cm, params) {
	PurgeFiles();
})
var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
	lineNumbers: true,
	mode: "text/x-csrc",
	keyMap: "vim",
	matchBrackets: true,
	showCursorWhenSelecting: true,
	inputStyle: "contenteditable",
	autofocus: true,
});
var commandDisplay = document.getElementById('command-display');
var keys = '';
CodeMirror.on(editor, 'vim-keypress', function (key) {
	keys = keys + key;
});
CodeMirror.on(editor, 'vim-command-done', function (e) {
	keys = '';
});

window.addEventListener('load', function () {
	OpenFile(window.location.hash.slice(1));
}, false)