import { useEffect, useState } from "react";
import React from "react";
import { ID } from "appwrite";
import {
  databases,
  DATABASEID,
  COLLECTIONID_MESSAGES,
} from "../appwriteConfig"
import {Trash} from 'react-feather'

function Room() {
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  useEffect(() => {
    getMessages();
  }, []);

  const deleteMessage = async (messageId) => {
    const promise = databases.deleteDocument(DATABASEID, COLLECTIONID_MESSAGES, messageId);
    // console.log("Deleted:", promise);
    setMessages(messages.filter(message=> message.$id !== messageId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(messageBody){
        let payload = {
            message: messageBody,
          };
          const response = await databases.createDocument(
            DATABASEID,
            COLLECTIONID_MESSAGES,
            ID.unique(),
            payload
          );
          setMessageBody('');
          getMessages()
    }
    
  };

  const getMessages = async () => {
    const response = await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_MESSAGES
    );
    console.log(response);
    setMessages(response.documents);
  };
  return (
    <>
      <main className="container">
        <div className="room--container">
        
          
          <div>
            {messages.map((messageObj) => (
              <div key={messageObj.$id} className="message--wrapper">
                <div className="message--header">
                  <small className="message-timestamp">
                  {new Date(messageObj.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </small>
                </div>
                <div className="message--body">
                  <span>{messageObj.message}</span>
                  
                </div>
                <Trash className="delete--btn" size={16} onClick={()=>{deleteMessage(messageObj.$id)}}/>
              </div>
            ))}
          </div>
          <form id="message--form">
            <div>
              <textarea
                required
                maxLength="1000"
                placeholder="Say something..."
                value={messageBody}
                onChange={(e)=>{setMessageBody(e.target.value)}}
              ></textarea>
            </div>
            <div className="send-btn--wrapper">
            <input className="btn btn--secondary" type="submit" value="Send" onClick={handleSubmit}/>
          </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default Room;
