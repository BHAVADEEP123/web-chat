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
import { data } from "autoprefixer";
import { ChevronsLeft, ChevronsRight, Check, X } from "react-feather";

function Room() {
  const { user, handleUserLogin, handleUserLogout } = useAuth()
  // console.log('user id:',user.$id)
  const [messagesByMe, setMessagesByMe] = useState([]);
  const [profileInfo, setProfileInfo] = useState(null);
  const [messagesToMe, setMessagesToMe] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [friends, setFriends] = useState([]);
  const [username, setUsername] = useState('');
  const [userTag, setUserTag] = useState('');
  const [reqFriendUserName, setReqFriendUserName] = useState('');
  const [reqFriendTag, setReqFriendTag] = useState('');
  const [friendRequests, setFriendReqests] = useState([]);

  const [currFrndReqUsername, setCurrFrndReqUsername] = useState('');
  const [currFrndReqIdx, setCurrFrndReqIdx] = useState(-1);
  const [currFrndReqTag, setCurrFrndReqTag] = useState('');
  const [currFrndReqId, setCurrFrndReqId] = useState('');

  const [hasFrndReq, setHasFrndReq] = useState(false);

  useEffect(() => {
    getMessages();
    getProfileData();
    getUserInfo();
    getUserFrndReqs();
    // intialiseFrndReq();
    // console.log('proflie data in useEffect1:',profileInfo)
    const unsubscribe = client.subscribe(`databases.${DATABASEID}.collections.${COLLECTIONID_MESSAGES}.documents`, response => {
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        setMessagesByMe(prevState => [...prevState, response.payload]);
      }
      if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
        setMessagesByMe(messagesByMe.filter(message => message.$id !== response.payload.$id));
        setMessagesToMe(messagesByMe.filter(message => message.$id !== response.payload.$id));
      }
    });
    return () => {
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

  const handleSendReq = async (e) => {
    // getProfileData();
    e.preventDefault();
    try {
      if (reqFriendTag.length !== 0 && reqFriendUserName.length !== 0) {
        console.log('reqFriendTag', reqFriendTag)
        console.log('reqFriendUserName', reqFriendUserName)
        const response = await databases.listDocuments(
          DATABASEID,
          COLLECTIONID_PROFILES,
          [
            Query.equal('username', reqFriendUserName),
            Query.equal('tag', reqFriendTag),
          ]
        )
        let frndRequestUserId = response['documents'][0].$id
        let frndprofileId = response['documents'][0]['userId']
        let alreadFriend = false
        for(let i=0;i<friends.length;i++){
          if(friends[i]['documents'][0]['userId']===frndprofileId){
            alreadFriend=true
            console.log("already your friend")
          }
        }
        console.log("is he already a friend:",alreadFriend)
        if (frndRequestUserId && !alreadFriend) {
          const doc = await databases.getDocument(
            DATABASEID,
            COLLECTIONID_PROFILES,
            frndRequestUserId
          )
          console.log('retrieved doc before:', doc)
          doc['FriendReqs'].push(user.$id);
          console.log('retrieved doc after:', doc)
          const updateResponse = await databases.updateDocument(
            DATABASEID,
            COLLECTIONID_PROFILES,
            frndRequestUserId,
            {
              'FriendReqs': doc['FriendReqs']
            }
          )
        }
        else{
          console.log('not sent any frnd req');
        }
        console.log('friendReq:', frndRequestUserId)
        setReqFriendTag('')
        setReqFriendUserName('')
      }
      else {
        console.log('fill details properly')
      }

    }
    catch (error) {
      console.log("error while sending friend req:", error);
    }
  }

  const getUserInfo = async () => {
    // console.log("working getUserInfo")
    try {
      const response = await databases.listDocuments(
        DATABASEID, COLLECTIONID_PROFILES, [
        Query.equal('userId', user.$id)
      ]
      )
      setUsername(response['documents'][0]['username'])
      // console.log('userInfo:',username)
      setUserTag(response['documents'][0]['tag'])
      // console.log('userInfo:',userTag)


    } catch (error) {
      console.log("error while fetching getUserInfo")
    }
  }

  const getProfileData = async () => {

    await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_PROFILES,
      [
        Query.equal('userId', user.$id)
      ]
    ).then(
      response => {
        console.log("user profile:", response)
        // setProfileInfo(response)
        // setUsername(response['documents'[0]['username']])
        // console.log('username:',response['documents'][0]['username'])

        // console.log('profileData:',profileInfo)
        const friendPromises = response.documents[0]['friends'].map(async (friend) => {
          return await databases.listDocuments(
            DATABASEID,
            COLLECTIONID_PROFILES,
            [Query.equal('userId', friend)]
          );
        });

        Promise.all(friendPromises).then(
          response => {
            console.log("friendsList:", response)
            setFriends(response);
          }
        )
        // console.log("final friends:", friends)


      }
    );

  }

  const getMessages = async () => {
    const response = await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_MESSAGES,
      [
        Query.equal('from_user', user.$id),
        // Query.equal('to_user',user.$id)
      ]
    );
    // console.log(response);
    const response2 = await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_MESSAGES,
      [
        Query.equal('to_user', user.$id),
      ]
    )
    setMessagesByMe(response.documents);
  };

  const [showFriendList, setShowFriendList] = useState(false);

  const toggleFriendList = () => {
    setShowFriendList(!showFriendList);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  // friend requests handling from here
  const getUserFrndReqs = async () => {
    const response = await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_PROFILES,
      [
        Query.equal('userId', user.$id)
      ]
    )
    // setFriendReqests(response['documents'][0]['FriendReqs']);
    let friendReqUserIds = response['documents'][0]['FriendReqs'];
    // console.log('friendReqsIds:', response['documents'][0]['FriendReqs']);
    if (friendReqUserIds.length !== 0) {
      const friendReqPromises = friendReqUserIds.map(async (friendreq) => {
        return await databases.listDocuments(
          DATABASEID,
          COLLECTIONID_PROFILES,
          [
            Query.equal('userId', friendreq)
          ]
        );
      });
      Promise.all(friendReqPromises).then(
        response => {
          setFriendReqests(response)
          if (response) {
            setHasFrndReq(true)
            setCurrFrndReqIdx(0);
            setCurrFrndReqId(response[0]['documents'][0]['userId'])
            setCurrFrndReqTag(response[0]['documents'][0]['tag'])
            setCurrFrndReqUsername(response[0]['documents'][0]['username'])
            console.log("intialised friendreqs")
          }
          console.log('friendReqs:', response);
        }
      )
    }
    console.log('has frnd req:', hasFrndReq)
  }

  const handlePrevReq = (e) => {
    e.preventDefault();

    if (currFrndReqIdx > 0 && friendRequests.length > 0) {
      // console.log('left:',currFrndReqIdx-1,friendRequests[currFrndReqIdx-1]['documents'][0]['userId'])
      setCurrFrndReqId(friendRequests[currFrndReqIdx - 1]['documents'][0]['userId']);
      setCurrFrndReqUsername(friendRequests[currFrndReqIdx - 1]['documents'][0]['username']);
      setCurrFrndReqTag(friendRequests[currFrndReqIdx - 1]['documents'][0]['tag']);
      setCurrFrndReqIdx(currFrndReqIdx - 1);
    }

  }

  const handleNextReq = (e) => {
    e.preventDefault();

    if (currFrndReqIdx < friendRequests.length - 1 && friendRequests.length > 0) {
      // console.log('right:',currFrndReqIdx+1,friendRequests[currFrndReqIdx+1]['documents'][0]['userId'])
      setCurrFrndReqId(friendRequests[currFrndReqIdx + 1]['documents'][0]['userId']);
      setCurrFrndReqUsername(friendRequests[currFrndReqIdx + 1]['documents'][0]['username']);
      setCurrFrndReqTag(friendRequests[currFrndReqIdx + 1]['documents'][0]['tag']);
      setCurrFrndReqIdx(currFrndReqIdx + 1);
    }
  }

  const handleAddFriend = async (e) => {
    e.preventDefault();
    const docs = await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_PROFILES,
      [
        Query.equal('userId', user.$id)
      ]
    )
    console.log('got profileId', docs)
    let doc = docs['documents'][0]
    let leftOverReqs = [];
    for (let i = 0; i < doc['FriendReqs'].length; i++) {
      if (doc['FriendReqs'][i] != currFrndReqId) {
        leftOverReqs.push(doc['FriendReqs'][i]);
      }
    }
    // setFriendReqests(leftOverReqs)
    console.log("friend reqs after adding:",leftOverReqs);
    if (leftOverReqs.length === 0) {
      setHasFrndReq(false);
    }
    let currFriends = doc['friends'];
    currFriends.push(currFrndReqId);
    const updateResponse = await databases.updateDocument(
      DATABASEID,
      COLLECTIONID_PROFILES,
      doc.$id,
      {
        'FriendReqs': leftOverReqs,
        'friends': currFriends
      }
    )
    console.log('updated friendReqs', updateResponse)

    const docs2 = await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_PROFILES,
      [
        Query.equal('userId', currFrndReqId),
      ]
    )
    let doc2 = docs2['documents'][0]
    console.log('got profileId2', docs2)

    let hisFriends = doc2['friends']
    console.log('his friends', hisFriends);
    hisFriends.push(user.$id);
    const updateResponse2 = await databases.updateDocument(
      DATABASEID,
      COLLECTIONID_PROFILES,
      doc2.$id,
      {
        'friends': hisFriends,
      }
    )
    console.log('updated friends', updateResponse2)
    getUserFrndReqs();
    getProfileData();
  }

  const handleDeleteReq = async(e)=>{
    e.preventDefault();
    const docs = await databases.listDocuments(
      DATABASEID,
      COLLECTIONID_PROFILES,
      [
        Query.equal('userId', user.$id)
      ]
    )
    let doc = docs['documents'][0]
    let leftOverReqs = [];
    for (let i = 0; i < doc['FriendReqs'].length; i++) {
      if (doc['FriendReqs'][i] != currFrndReqId) {
        leftOverReqs.push(doc['FriendReqs'][i]);
      }
    }
    // setFriendReqests(leftOverReqs)
    console.log("friend reqs after adding:",leftOverReqs);
    if (leftOverReqs.length === 0) {
      setHasFrndReq(false);
    }
    const updateResponse = await databases.updateDocument(
      DATABASEID,
      COLLECTIONID_PROFILES,
      doc.$id,
      {
        'FriendReqs': leftOverReqs
      }
    )
    getUserFrndReqs();
  }

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
              {username}
            </div>
            <div className="user-tag">
              #{userTag}
            </div>

            <LogOut color="white" cursor="pointer" onClick={handleUserLogout} />
          </div>
          {/* friends */}
          <div className="friends-section">
            <h3>Friends</h3>
          </div>
          {friends.map((friend) => (
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
          {/* Friend Requests */}
          <div className="friend-requests">
          <div className="friend-req-header">
              <h3>Friend Requests</h3>
            </div>
            {hasFrndReq ? (<><div className="frnd-req-wrapper">
                <div className="pointerOnHover">
                  <ChevronsLeft color="white" onClick={handlePrevReq} />
                </div>
                <div className="friend-req-info">
                  <div className="user-info">
                    <div className="friend-req-name">
                      {currFrndReqUsername}
                    </div>
                    <div className="friend-req-tag">
                      #{currFrndReqTag}
                    </div>
                  </div>
                  <div className="accept-decline">
                    <div className="pointerOnHover">
                      <X color="red" onClick={handleDeleteReq}/>
                    </div>
                    <div className="pointerOnHover">
                      <Check color="green" onClick={handleAddFriend} />
                    </div>
                  </div>
                </div>
                <div className="pointerOnHover">
                  <ChevronsRight color="white" onClick={handleNextReq} />
                </div>
              </div></>) : (<h1>EMPTY</h1>)}
          </div>

          {/* add-friend section */}

          <div className="addFriend">
            <div className="input-container">
              <input type="text" className="input-field" placeholder="User Id" onChange={(e) => { setReqFriendUserName(e.target.value) }} value={reqFriendUserName} />
              <div className="line"></div>
            </div>
            <div className="input-container">
              <input type="text" className="input-field" placeholder="Hashtag" onChange={(e) => { setReqFriendTag(e.target.value) }} value={reqFriendTag} />
              <div className="line"></div>
            </div>
            <div className="addbutton">
              <UserPlus onClick={handleSendReq} color="white" />
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