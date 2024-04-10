import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { account } from '../appwriteConfig';
import '../styles/signup.css'
import { ID } from "appwrite";
import {
    databases,
    DATABASEID,
    COLLECTIONID_PROFILES,
  } from "../appwriteConfig"

const Signup = () => {
    const navigate = useNavigate();
    const handleRedirectSignin = () => {
        navigate('/login')
    }
    const [username, setUsername] = useState('');
    const [tag, setTag] = useState('');
    const [email,setUserEmail] = useState('');
    const [password,setUserPassword] = useState('');
    const handleSignup= async (e)=>{
        e.preventDefault()
        // console.log(username)
        // console.log(tag)
        // console.log(password)
        // console.log(email)
        await account.create(ID.unique(),email, password, username, []).then(
            response =>{
                let payload = {
                    userId : response.$id,
                    tag : tag,
                    username : username,
                }
                databases.createDocument(
                    DATABASEID,
                    COLLECTIONID_PROFILES,
                    ID.unique(),
                    payload
                  );
            },
            navigate('/login')
        )
    }
    return (
        <div className="signup-page">
            <div className="signup-container">
                <h2>Signup</h2>
                <form>
                    <div className="userTag">
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" name="username" placeholder="username" required onChange={(e) => { setUsername(e.target.value) }} />
                        </div>
                        <div className="input-group">
                            <label htmlFor="tag">Tag</label>
                            <input type="number" id="tag" name="tag" placeholder="4 digit tag" required onChange={(e) => { setTag(e.target.value) }} />
                        </div>
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="Enter your email" required onChange={(e) => { setUserEmail(e.target.value) }} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="Enter your password" required onChange={(e) => { setUserPassword(e.target.value) }} />
                    </div>
                    <button type="button" className="signup-btn signup-btn-primary" onClick={(e) => { handleSignup(e) }}>Register</button>
                </form>
                <div className="redirectSignin">
                    <p>Already a user? <span onClick={handleRedirectSignin}>sign in</span></p>
                </div>
            </div>
        </div>
    )
}

export default Signup