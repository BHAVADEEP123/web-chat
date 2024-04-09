import React from "react";
import '../styles/login.css';
import { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";

const login = () => {

  const {user,handleUserLogin} = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  },[]);
  const [userEmail,setUserEmail] = useState('');
  const [password,setPassword] = useState('');
  const handleSubmit = ()=>{
    console.log(userEmail)
    console.log(password)
    
  }
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <form>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required onChange={(e) => { setUserEmail(e.target.value) }}/>
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required onChange={(e) => { setPassword(e.target.value) }}/>
          </div>
          <button type="button" className="login-btn login-btn-primary" onClick={(e)=>{handleUserLogin(e,userEmail,password)}}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default login;
