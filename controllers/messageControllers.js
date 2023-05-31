const User = require('../models/User');
const Message = require('../models/message');

//caesar cipher
// Simple Caesar cipher implementation
const caesarCipher = (text, shift) => {
  let result = '';

  for (let i = 0; i < text.length; i++) {
    let char = text[i];

    if (char.match(/[a-z]/i)) {
      const code = text.charCodeAt(i);

      if (code >= 65 && code <= 90) {
        char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
    }

    result += char;
  }

  return result;
};

// Get all messages
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    // Decrypt the message content using the Caesar cipher
    const decryptedMessages = messages.map((message) => {
      const decryptedContent = caesarCipher(message.content, -3); // Example: Shift back by 3
      return { ...message._doc, content: decryptedContent };
    });
    console.log(decryptedMessages);

    res.status(200).json({ messages: decryptedMessages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

//new Message
const newmessages = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    // Encrypt the message content using the Caesar cipher
    const encryptedContent = caesarCipher(content, 3); // Example: Shift by 3
    console.log(encryptedContent);

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newMessage = new Message({
      sender: sender._id,
      receiver: receiver._id,
      content: encryptedContent,
    });

    await newMessage.save();

    // Update sender's sentMessages array
    sender.sentMessages.push(newMessage._id);
    await sender.save();

    // Update receiver's receivedMessages array
    receiver.receivedMessages.push(newMessage._id);
    await receiver.save();

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

//Update a message
const updateMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    console.log(messageId);

    const { content } = req.body;

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { content },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message updated successfully', updatedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update message' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

module.exports = {
  newmessages,
  updateMessage,
  getAllMessages,
  deleteMessage,
};
