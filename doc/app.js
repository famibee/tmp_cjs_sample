/* ***** BEGIN LICENSE BLOCK *****
	Copyright (c) 2018-2025 Famibee (famibee.blog38.fc2.com)

	This software is released under the MIT License.
	http://opensource.org/licenses/mit-license.php
** ***** END LICENSE BLOCK ***** */

// electron メインプロセス
const {crashReporter, app, Menu} = require('electron');
const {resolve} = require('node:path');
const {default: openAboutWindow} = require('about-window');

const package_json_dir = resolve(__dirname, '../');
const pkg = require('../package.json');
app.name = pkg.name;	// 非パッケージだと 'Electron' になる件対応
app.setPath('userData', app.getPath('appData') +'/'+ app.name);
// メニューの「このアプリについて」のデザイン
//	・rhysd/electron-about-window: 'About This App' mini-window for Electron apps https://github.com/rhysd/electron-about-window
const icon_path = resolve(__dirname, 'app/icon.png');
const css_path = resolve(__dirname, 'app/about-window.css');


crashReporter.start({
	productName	: app.name,
	companyName	: pkg.publisher,
	submitURL	: pkg.homepage,
	compress	: true,
});
if (! app.requestSingleInstanceLock()) app.quit();

let guiWin = null;
app.on('second-instance', ()=> {
	if (! guiWin) return;

	if (guiWin.isMinimized()) guiWin.restore();
	guiWin.focus();
});
app.whenReady().then(async ()=> {
	const w = guiWin = require('@famibee/skynovel/appMain').initRenderer(
		resolve(__dirname, 'app/index.htm'),
		pkg.version,
	)
	.on('close', ()=> app.exit());

	const isMac = (process.platform === 'darwin');
	const wc = w.webContents;
	const menu = Menu.buildFromTemplate([{
		label: app.name,
		submenu: [
			{label: 'このアプリについて', click: ()=> openAboutWindow({
				icon_path,
				package_json_dir,
				copyright	: 'Copyright '+ pkg.appCopyright +' 2025',
				// description	: ' ',	// 詳細が不要ならコメントイン
				license		: '',
				use_version_info	: false,
				css_path,
			})},
			{type: 'separator'},
			{label: 'DevTools', click: ()=> wc.openDevTools(), accelerator: 'F12'},
			isMac ?{role: 'close'} :{role: 'quit'},
		],
	}]);
	Menu.setApplicationMenu(menu);
});
