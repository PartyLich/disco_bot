/**
 * Remove message from chat
 * @param  {Message} message The Discord message to act upon
 */
export function cleanMessage(message) {
  // Delete a message
  message
      .delete()
      .then((message) =>
        console.log(`Deleted message from ${message.author.username}`)
      )
      .catch((e) => console.error(e));
}
