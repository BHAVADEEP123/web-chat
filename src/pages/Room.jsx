import { useEffect, useState } from "react";
import React from "react";
import { ID } from "appwrite";
import { Query } from "appwrite";
import '../styles/Room.css'
import {
  databases,
  DATABASEID,
  COLLECTIONID_MESSAGES,
  COLLECTIONID_PROFILES,
} from "../appwriteConfig"
import { Trash } from 'react-feather'
import { ChevronLeft, ChevronRight, UserPlus, Send, LogOut } from 'react-feather'
import client from "../appwriteConfig";
import { useAuth } from "../utils/AuthContext";

function Room() {
  const {user,handleUserLogin,handleUserLogout} = useAuth()
  // console.log('user id:',user.$id)
  const [messagesByMe, setMessagesByMe] = useState([]);
  const [messagesToMe, setMessagesToMe] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [profile, setProfile] = useState(null);
  const [friendsUserIds, setFriendsUserIds] = useState([]);
  const [friends,setFriends] = useState([]);
  useEffect(() => {
    getMessages();
    getProfileData();
    const unsubscribe =client.subscribe(`databases.${DATABASEID}.collections.${COLLECTIONID_MESSAGES}.documents`,response=>{
      if(response.events.includes('databases.*.collections.*.documents.*.create')){
        setMessagesByMe(prevState=>[...prevState,response.payload]);
      }
      if(response.events.includes('databases.*.collections.*.documents.*.delete')){
        setMessagesByMe(messagesByMe.filter(message => message.$id !== response.payload.$id));
        setMessagesToMe(messagesByMe.filter(message => message.$id !== response.payload.$id));
      }
    });
    return()=>{
      unsubscribe();
    }
  }, []);

  const deleteMessage = async (messageId) => {
    const promise = databases.deleteDocument(DATABASEID, COLLECTIONID_MESSAGES, messageId);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (messageBody) {
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
      // setMessagesByMe(prevState=>[response,...prevState])
    }

  };

  const getProfileData = async () =>{
    // const response = await databases.listDocuments(
    //   DATABASEID,
    //   COLLECTIONID_PROFILES,
    //   [
    //     Query.equal('userId',user.$id)
    //   ]
    // )
    // setFriendsUserIds(response.documents[0]['friends'])
    // console.log("My profile:", response)
    // console.log("My friends:", friendsUserIds)
    // await Promise.all(friendsUserIds.map(async (friendsUserId)=>{
    //   const friendUserResponse = await databases.listDocuments(
    //     DATABASEID,
    //     COLLECTIONID_PROFILES,
    //     [
    //       Query.equal('userId',friendsUserId)
    //     ]
    //   )
    //   friends.push(friendUserResponse)
    // }))
    // console.log(friends)
    await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_PROFILES,
      [
        Query.equal('userId',user.$id)
      ]
    ).then(
      response=>{
        console.log("user profile:",response)
        const friendPromises = response.documents[0]['friends'].map(async (friend) => {
          return await databases.listDocuments(
            DATABASEID,
            COLLECTIONID_PROFILES,
            [Query.equal('userId', friend)]
          );
        });
      
        Promise.all(friendPromises).then(
          response=>{
            console.log("friendsList:",response)
            setFriends(response);
          }
        )
        console.log("final friends:",friends)
      }
    )
  }

  const getMessages = async () => {
    const response = await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_MESSAGES,
      [
        Query.equal('from_user',user.$id),
        // Query.equal('to_user',user.$id)
      ]
    );
    console.log(response);
    const response2 = await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_MESSAGES,
      [
        Query.equal('to_user',user.$id),
      ]
    )
    setMessagesByMe(response.documents);
  };

  const [showFriendList, setShowFriendList] = useState(false);

  const toggleFriendList = () => {
    setShowFriendList(!showFriendList);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' ) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <div className="container">
        <div className="chatroom">
          <div className="chats">
            {messagesByMe.map((messageObj) => (
              <div key={messageObj.$id} className="text-message">
                <div className="message--body">
                  <div className="message-timestamp">
                    {new Date(messageObj.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                  <span>{messageObj.message}</span>
                </div>
                <div className="trash-button">
                  <Trash className="delete--btn" size={16} onClick={() => { deleteMessage(messageObj.$id) }} />
                </div>
              </div>
            ))}
          </div>

        </div>
        <form>
          <div className="sender">
            <div className="sendbox">
              <textarea
                required
                maxLength="1000"
                onKeyDown={handleKeyDown}
                placeholder="Say something..."
                value={messageBody}
                onChange={(e) => { setMessageBody(e.target.value) }}
              ></textarea>
            </div>
            <div className="send-btn">
              <Send color="white" onClick={handleSubmit} />
            </div>
          </div>
        </form>
        <div className={`friendList ${showFriendList ? 'visible' : ''}`}>
          {/* profile */}
          <div className="profile-box">
            <div className="user-icon">
              <img src="https://iili.io/JNkdzyx.png" alt="male user"></img>
            </div>
            <div className="user-name">
              Bhavadeep
            </div>
            <LogOut color="white" cursor="pointer" onClick={handleUserLogout}/>
          </div>
          {/* friends */}
          <div className="friends-section">
            <h3>Friends</h3>
          </div>
          {friends.map((friend)=>(
            <div className="friendListContent" id={friend['documents'][0].$id}>
            <div className="box">
              <div className="user-icon">
                <img src="https://iili.io/JNkdzyx.png" alt="male user"></img>
              </div>
              <div className="user-name">
                {friend['documents'][0]['username']}
              </div>
              <div className="user-tag">
              #{friend['documents'][0]['tag']}
              </div>
            </div>
          </div>
          ))}
          {/* add-friend section */}

          <div className="addFriend">
            <div className="input-container">
              <input type="text" className="input-field" placeholder="User Id" />
              <div className="line"></div>
            </div>
            <div className="input-container">
              <input type="text" className="input-field" placeholder="Hashtag" />
              <div className="line"></div>
            </div>
            <div className="addbutton">
              <UserPlus color="white" />
            </div>
          </div>
        </div>
        <button className="toggleButton" onClick={toggleFriendList}>
          {showFriendList ? <ChevronRight color="white" /> : <ChevronLeft color="white" />}
        </button>
      </div>
    </>
  );
}

export default Room;