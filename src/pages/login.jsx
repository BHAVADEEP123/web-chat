import React from "react";

const login = () => {
  return (
    <div>
      <div className="auth--container">
      <h2>Login</h2>
          <form className="form--wrapper">
            <div className="field--wrapper">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" />
            </div>
            <div className="field--wrapper">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" />
            </div>
            <div className="btn">
              <button className="btn btn--secondary" type="button">
                Login
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default login;
