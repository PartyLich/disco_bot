import path from 'path';
import {VLINES} from './vlines.json';
import {randInt} from './randInt';

export function playVoiceLine(serverQueue, lineType) {
  const dialog = VLINES[lineType];
  const voiceLine = path.resolve(dialog[randInt(dialog.length - 1)]);

  return new Promise((resolve, reject) => {
    if (!serverQueue) reject(new Error('serverQueue cannot be null.'));

    serverQueue.connection
        .playFile(voiceLine)
        .on('end', () => {
          console.log('playVoiceLine end');
          resolve();
        })
        .on('debug', (info) => console.info('debug', info))
        .on('error', (e) => {
          reject(e);
        });
  });
}
