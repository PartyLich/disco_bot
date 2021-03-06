import fs from 'fs';
import path from 'path';
import {VLINES} from './vlines.json';
import {randInt} from './randInt';

/**
 * Play a randomly selected voiceline from the file system
 * @param  {Object} serverQueue the contract for our song queue
 * @param  {String} lineType    voiceline group identifier
 * @return {Promise}
 */
export function playVoiceLine(serverQueue, lineType) {
  const dialog = VLINES[lineType];
  const voiceLine = path.join(__dirname, '..', dialog[randInt(dialog.length - 1)]);

  return new Promise((resolve, reject) => {
    if (!serverQueue) reject(new Error('serverQueue cannot be null.'));

    console.log(`playVoiceLine start: file ${voiceLine}`);

    serverQueue.connection
        .playStream(fs.createReadStream(voiceLine))
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
