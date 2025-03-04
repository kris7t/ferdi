import { app, ipcMain, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { GITHUB_NIGHTLIES_REPO_NAME, GITHUB_ORG_NAME } from '../../config';
import { isMac, isWindows } from '../../environment';

const debug = require('debug')('Ferdi:ipcApi:autoUpdate');

export default (params: { mainWindow: BrowserWindow; settings: any }) => {
  const enableUpdate = Boolean(params.settings.app.get('automaticUpdates'));

  if (!enableUpdate) {
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.autoDownload = false;
  } else if (isMac || isWindows || process.env.APPIMAGE) {
    ipcMain.on('autoUpdate', (event, args) => {
      if (enableUpdate) {
        try {
          autoUpdater.autoInstallOnAppQuit = false;
          autoUpdater.allowPrerelease = Boolean(
            params.settings.app.get('beta'),
          );
          autoUpdater.channel = autoUpdater.allowPrerelease ? 'beta' : 'latest';

          if (params.settings.app.get('nightly')) {
            autoUpdater.allowPrerelease = Boolean(
              params.settings.app.get('nightly'),
            );
            autoUpdater.channel = 'alpha';
            autoUpdater.setFeedURL({
              provider: 'github',
              owner: GITHUB_ORG_NAME,
              repo: GITHUB_NIGHTLIES_REPO_NAME,
            });
          }

          if (args.action === 'check') {
            debug('checking for update');
            autoUpdater.checkForUpdates();
          } else if (args.action === 'install') {
            debug('installing update');
            autoUpdater.quitAndInstall();
            // we need to send a quit event
            setTimeout(() => {
              app.quit();
            }, 20);
          }
        } catch (error) {
          console.error(error);
          event.sender.send('autoUpdate', { error: true });
        }
      }
    });

    autoUpdater.on('update-not-available', () => {
      debug('update-not-available');
      params.mainWindow.webContents.send('autoUpdate', { available: false });
    });

    autoUpdater.on('update-available', event => {
      debug('update-available');

      if (enableUpdate) {
        params.mainWindow.webContents.send('autoUpdate', {
          version: event.version,
          available: true,
        });
      }
    });

    autoUpdater.on('download-progress', progressObj => {
      let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
      logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
      logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;

      debug(logMessage);
    });

    autoUpdater.on('update-downloaded', () => {
      debug('update-downloaded');
      params.mainWindow.webContents.send('autoUpdate', { downloaded: true });
    });

    autoUpdater.on('error', () => {
      debug('update-error');
      params.mainWindow.webContents.send('autoUpdate', { error: true });
    });
  }
};
