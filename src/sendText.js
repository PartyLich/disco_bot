export default send;

/**
 * Send content to a text channel
 * @param channel Channel to receive content
 * @param content  Content to send
 * @return {Promise}
 */
async function send(channel, content) {
  return new Promise((resolve, reject) => {
    try {
      const sentMessage = await channel.send(content);
      resolve(sentMessage);
    } catch (err) {
      reject(err);
    }
  });
}
