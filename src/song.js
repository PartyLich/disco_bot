/**
 * Generate Song object from ytdl songInfo
 * @param {Object} songInfo ytdl songInfo
 * @param {GuildMember} requestor user that requested the song
 * @constructor
 */
export default function Song(songInfo, requestor) {
  const songFile = '';
  const lenSeconds = ('00' + (songInfo.length_seconds % 60)).slice(-2);
  const lenMinutes = ('00' + Math.floor(songInfo.length_seconds / 60)).slice(
      -2
  );
  const lenString = `${lenMinutes}:${lenSeconds}`;
  const thumbnail = getThumbnail(songInfo);
  console.log(`song thumbnail: ${thumbnail}`);

  return {
    title: songInfo.title,
    url: songInfo.video_url,
    file: songFile,
    length: lenString,
    requestor,
    thumbnail,
  };
}

function getThumbnail(songInfo) {
  const {thumbnails} = songInfo.player_response.videoDetails.thumbnail;
  const {url: thumbnail} = thumbnails[thumbnails.length - 1];

  return thumbnail;
}
