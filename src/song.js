/**
 * Generate Song object from ytdl songInfo
 * @param {Object} songInfo ytdl songInfo
 * @param {GuildMember} requestor user that requested the song
 * @constructor
 */
export default function Song(songInfo, requestor) {
  const songFile = '';
  // TODO: use a lens
  const len = viewLength(songInfo);

  return {
    title: songInfo.player_response.videoDetails.title,
    url: songInfo.video_url,
    file: songFile,
    length: len.string,
    lengthSeconds: len.lengthSeconds,
    requestor,
    thumbnail: getThumbnail(songInfo),
  };
}

/**
 * Get thumbnail url from the ytdl songInfo
 * @param {Object} songInfo ytdl songInfo
 * @return {String} thumbnail url
 */
function getThumbnail(songInfo) {
  const {thumbnails} = songInfo.player_response.videoDetails.thumbnail;
  const {url: thumbnail} = thumbnails[thumbnails.length - 1];

  return thumbnail;
}

/**
 * Get song length info from songInfo object
 * @param {Object} songInfo ytdl songInfo
 * @return {String} thumbnail url
 */
function viewLength(songInfo) {
  if (!songInfo.player_response.videoDetails.lengthSeconds) {
    return {
      string: '?:?',
      lengthSeconds: 0,
    };
  }

  const {lengthSeconds} = songInfo.player_response.videoDetails;
  const lenMinutes = ('00' + Math.floor(lengthSeconds / 60)).slice(-2);

  return {
    string: `${lenMinutes}:${('00' + (lengthSeconds % 60)).slice(-2)}`,
    lengthSeconds,
  };
}
