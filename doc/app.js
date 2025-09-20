/* ***** BEGIN LICENSE BLOCK *****
	Copyright (c) 2018-2025 Famibee (famibee.blog38.fc2.com)

	This software is released under the MIT License.
	http://opensource.org/licenses/mit-license.php
** ***** END LICENSE BLOCK ***** */

// electron メインプロセス
const {crashReporter, app, Menu} = require('electron');
const {join} = require('path');

const pkg = require('../package.json');
app.name = pkg.name;	// 非パッケージだと 'Electron' になる件対応
app.setPath('userData', app.getPath('appData') +'/'+ app.name);

crashReporter.start({
	productName	: app.name,
	companyName	: "電子演劇部",
	submitURL	: pkg.homepage,
	compress	: true,
});
if (! app.requestSingleInstanceLock()) app.quit();
app.on('window-all-closed', ()=> app.quit());

let guiWin = null;
app.on('second-instance', ()=> {
	if (! guiWin) return;

	if (guiWin.isMinimized()) guiWin.restore();
	guiWin.focus();
});
app.whenReady().then(async ()=> {
	const w = guiWin = require('@famibee/skynovel/appMain').initRenderer(
		join(__dirname, 'app/index.htm'),
		pkg.version,
	);

	const isMac = (process.platform === 'darwin');
	const wc = w.webContents;
	const menu = Menu.buildFromTemplate([{
		label: app.name,
		submenu: [
			{label: 'このアプリについて', click: ()=> {
				const bw_aw = require('about-window').default({
					icon_path	: join(__dirname, 'app/icon.png'),
					package_json_dir	: __dirname,
					copyright	: 'Copyright '+ pkg.appCopyright +' 2025',
					homepage	: pkg.homepage,
					license		: '',
					use_version_info	: false,
				});
				w.on('close', ()=> bw_aw.close());
			}},
			{type: 'separator'},
			{label: 'DevTools', click: ()=> wc.openDevTools(), accelerator: 'F12'},
			isMac ?{role: 'close'} :{role: 'quit'},
		],
	}]);
	Menu.setApplicationMenu(menu);
});
