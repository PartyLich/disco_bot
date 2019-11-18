import {zeroPad} from './util';
import {compose, lensPath, lensProp, view} from 'ramda';

const detailsLens = lensPath(['player_response', 'videoDetails']);
const titleLens = compose(detailsLens, lensProp('title'));

/**
 * Generate Song object from ytdl songInfo
 * @param {Object} songInfo ytdl songInfo
 * @param {GuildMember} requestor user that requested the song
 * @constructor
 */
export default function Song(songInfo, requestor) {
  const songFile = '';
  const len = viewLength(view(detailsLens, songInfo));

  return {
    title: view(titleLens, songInfo),
    url: songInfo.video_url,
    file: songFile,
    length: len.string,
    lengthSeconds: len.lengthSeconds,
    requestor,
    thumbnail: getThumbnail(view(detailsLens, songInfo)),
  };
}

/**
 * Get thumbnail url from the ytdl songInfo
 * @param {Object} songInfo ytdl songInfo
 * @return {String} thumbnail url
 */
function getThumbnail(songInfo) {
  const {thumbnails} = songInfo.thumbnail;
  const {url: thumbnail} = thumbnails[thumbnails.length - 1];

  return thumbnail;
}

/**
 * Get song length info from songInfo object
 * @param {Object} songInfo ytdl songInfo
 * @return {String} thumbnail url
 */
function viewLength({lengthSeconds}) {
  if (!lengthSeconds) {
    return {
      string: '?:?',
      lengthSeconds: 0,
    };
  }

  const lenMinutes = zeroPad(2, Math.floor(lengthSeconds / 60));

  return {
    string: `${lenMinutes}:${zeroPad(2, lengthSeconds % 60)}`,
    lengthSeconds,
  };
}
