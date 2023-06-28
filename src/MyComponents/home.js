import React, { useState, useEffect, useRef } from 'react';
import chatlogo from './cat2.jpg';
import './homeStyle.css';
import { FaUsers, FaPaperPlane } from 'react-icons/fa';
import io from 'socket.io-client';
const socket = io.connect('http://ec2-52-66-205-55.ap-south-1.compute.amazonaws.com:3000/');

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const messageBoxRef = useRef(null);

  useEffect(() => {
    const name = prompt('Enter your anonymous name');
    socket.emit('new-user-joined', name);

    socket.on('users-update', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('receive', (data) => {
      append({ content: data.message, sender: data.name }, 'left');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const append = (message, position) => {
    setMessages((prevMessages) => [...prevMessages, { content: message.content, position: position, sender: message.sender }]);
  };

  const handleInputChange = (e) => {
    let text = e.target.innerText;
    if (e.key === '\n') {
      text += '\u2003';
    }
    setMessage(text);
  };
  const handleSend = () => {
    if (message.trim() !== '') {
      const newMessage = {
        content: message,
        sender: 'You',
      };
      append(newMessage, 'right');
      socket.emit('send', message);
      setMessage('');
      const textField = document.querySelector('.textField');
      textField.textContent = '';
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="header">
        <img className="logo" src={chatlogo} alt="chat symbol"/>
        <h1>Cat Chat</h1>
        <button className="panelButton" onClick={togglePanel}>
          <FaUsers size={25} />
        </button>

        {isOpen && (
          <div className="slideBar">
            <button className="closeButton" onClick={togglePanel}>
              &times;
            </button>

            <div className="onlineContainer">
              <div className="onlineDot" />
              <p className="onlineTag">Online</p>
            </div>

            <div className="content">
              <div className="userContainerWrapper">
                <div className="userContainer">
                  {users.map((user, index) => (
                    <div className="user" key={index}>
                      <p className="userName">{user}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="chatContainer">
        <div className="messageBox" ref={messageBoxRef}>
          {messages.map((msg, index) => (
            <div className={`message ${msg.position}`} key={index}>
              <p>{msg.sender}: {msg.content}</p>
            </div>
          ))}
        </div>
        <div className="inputContainer">
        <div
            className={`textField ${message ? 'hasValue' : ''}`}
            contentEditable="true"
            onInput={handleInputChange}
            onKeyDown={handleInputChange}
            placeholder="Message"
          ></div>
          <button className="sendButton" onClick={handleSend}>
            <FaPaperPlane size={25} /></button>
        </div>
      </div>
    </>
  );
}

export default Home;
