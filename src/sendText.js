export default send;

/**
 * Send content to a text channel
 * @param {TextChannel} channel Channel to receive content
 * @param {Object|String} content  Content to send
 * @return {Promise}
 */
function send(channel, content) {
  return new Promise(async (resolve, reject) => {
    try {
      const sentMessage = await channel.send(content);
      resolve(sentMessage);
    } catch (err) {
      reject(err);
    }
  });
}
