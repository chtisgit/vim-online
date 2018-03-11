
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

function ShowExplorer() {
        document.getElementById('t').textContent = storage.Name();
        document.getElementById('codeview').style.display = 'none';
        document.getElementById('explorer').style.display = 'block';
        storage.GetFileList(function (files) {
                var ul = document.getElementById('filelist');
                while (ul.firstChild) {
                        ul.removeChild(ul.firstChild);
                }
                for (var i = 0; i < files.length; i++) {
                        var li = document.createElement('li');
                        var a = document.createElement('a');
                        a.href = '#';
                        a.addEventListener('click', function (ev) {
                                var filename = undefined;
                                if (ev.srcElement.id != 'newfile')
                                        filename = ev.srcElement.textContent;
                                ShowEditor(filename);
                        });
                        a.textContent = files[i];
                        li.appendChild(a);
                        ul.appendChild(li);
                }
                document.getElementById('quota').textContent = 'Used disk space: ' + storage.Quota();
        });
}

function Focus() {
        var cm = document.getElementsByClassName('CodeMirror-sizer');
        if (!cm || cm.length < 1) return;
        cm[0].focus();
}

function ShowEditor(filename) {
        document.getElementById('t').textContent = storage.Name();
        document.getElementById('codeview').style.display = 'block';
        document.getElementById('explorer').style.display = 'none';

        window.setTimeout(function () {
                storage.OpenFile(filename);
                //Focus();
        }, 0)
}

function ParamFilename(params) {
        if (typeof (params) == 'string') return params;
        if (!params || !params.args || params.args.length < 1) return undefined;
        return params.args[0];
}

CodeMirror.Vim.defineEx("open", "o", function (cm, params) {
        storage.OpenFile(params);
})
CodeMirror.Vim.defineEx("write", "w", function (cm, params) {
        storage.WriteFile(params);
})
CodeMirror.Vim.defineEx("quit", "q", function (cm, params) {
        ShowExplorer();
})
CodeMirror.Vim.defineEx("xxx", "x", function (cm, params) {
        storage.WriteFile(params);
        ShowExplorer();
})
CodeMirror.Vim.defineEx("purge", "purge", function (cm, params) {
        storage.PurgeFiles();
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
        ShowEditor(window.location.hash.slice(1));
}, false)