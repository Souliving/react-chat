import React, { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { useParams } from 'react-router-dom'
import sendIcon from '../components/sendIcon'

const ChatPage = () => {

    const [messages, setMessages] = useState([]);
    const [isConnectionOpen, setConnectionOpen] = useState(false)
    const [messageBody, setMessageBody] = useState("");

    const { username } = useParams();
    const ws = useRef();
    const userGeorge = {
      id: "1",
      name: "george"
    }

    const userMasha = {
      id: "2",
      name: "masha"
    }
    const sendMessage = () => {
        if(messageBody) {
          var chatMessage = {}  
          if(username === userGeorge.name) {
              chatMessage.id = userGeorge.id
              chatMessage.chatId = "123"
              chatMessage.senderId = userGeorge.id 
              chatMessage.recipientId = userMasha.id
              chatMessage.senderName = userGeorge.name
              chatMessage.recipientName = userMasha.name
            } else {
              chatMessage.id = userMasha.id
              chatMessage.chatId = "123"
              chatMessage.senderId = userMasha.id
              chatMessage.recipientId = userGeorge.id
              chatMessage.senderName = userMasha.name
              chatMessage.recipientName = userGeorge.name
            }

            chatMessage.content = messageBody
            chatMessage.sentAt = new Date().getTime().toString()
            chatMessage.status = "DELIVERED"
            
            
            ws.current.send(
                JSON.stringify({
                  id : chatMessage.id,
                  chatId: chatMessage.chatId,
                  senderId: chatMessage.senderId,
                  recipientId: chatMessage.recipientId,
                  senderName: chatMessage.senderName,
                  recipientName: chatMessage.recipientName,
                  content: chatMessage.content,
                  sentAt: chatMessage.sentAt,
                  status: chatMessage.status
                })
            );

            setMessageBody("");
        }
    };

    const getMessages = async () => {
        const response = await fetch("http://0.0.0.0:8080/allChatMessages")
        const messages = await response.json()
        console.log(messages)
        return messages
    }

    useEffect(() => {
        ws.current = new WebSocket("ws://0.0.0.0:8080");
        ws.current.onopen = async () => {
            console.log("Connection Opened");
            setConnectionOpen(true);
            const data = await getMessages()
            console.log(data[0])
            data.forEach((element) => setMessages((_messages) => [..._messages, element]));
            
        }
        ws.current.onmessage = (event) => {
            console.log(event.data)
            const data = JSON.parse(event.data);
            console.log(data.senderName)
            setMessages((_messages) => [..._messages, data]);
        };
        return () => {
            console.log("Cleaning up...");
            ws.current.close();
        }
    }, []);

    const scrollTarget = useRef(null);

    useEffect(() => {
        if(scrollTarget.current) {
            scrollTarget.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages.length]);

  return (
    <Layout>
        <div id="chat-view-container" className="flex flex-col w-1/3">
        {messages.map((message, index) => (
          <div key={index} className={`my-3 rounded py-3 w-1/3 text-white ${
            message.senderName === username ? "self-end bg-purple-600" : "bg-blue-600"
          }`}>
            <div className="flex items-center">
              <div className="ml-2">
                <div className="flex flex-row">
                  <div className="text-sm font-medium leading-5 text-gray-900">
                    {message.senderName} at
                  </div>
                  <div className="ml-1">
                    <div className="text-sm font-bold leading-5 text-gray-900">
                      {new Date(Number(message.sentAt)).toLocaleTimeString({
                        timeStyle: "short",
                      })}{" "}
                    </div>
                  </div>
                </div>
                <div className="mt-1 text-sm font-semibold leading-5">
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollTarget} />
      </div>
      <footer className="w-1/3">
        <p>
          You are chatting as <span className="font-bold">{username}</span>
        </p>

        <div className="flex flex-row">
          <input
            id="message"
            type="text"
            className="w-full border-2 border-gray-200 focus:outline-none rounded-md p-2 hover:border-purple-400"
            placeholder="Type your message here..."
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            required
          />
          <button
            aria-label="Send"
            onClick={sendMessage}
            className="m-3"
            disabled={!isConnectionOpen}
          >
            {sendIcon}
          </button>
        </div>
      </footer>
    </Layout>
  )
}

export default ChatPage
