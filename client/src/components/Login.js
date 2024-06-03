import React, { useState } from "react";
import axios from "axios";
import "../styles/Login.css"; // Import CSS file

function Login({ onLoginSuccess }) {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginResponse, setLoginResponse] = useState(null); // State to store login response

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent default form submission
    axios
      .post("http://localhost:3000/auth/login", {
        username: loginUsername,
        password: loginPassword,
      })
      .then((response) => {
        console.log("Logged in:", response.data);
        setLoginResponse(response.data); // Set the response in state
        onLoginSuccess(); // Call the onLoginSuccess function
      })
      .catch((error) => {
        console.error("Login error:", error);
        setLoginResponse(error); // Set the error response in state
      });
  };

  const handleRegister = (e) => {
    e.preventDefault(); // Prevent default form submission
    axios
      .post("http://localhost:3000/auth/register", {
        username: registerUsername,
        password: registerPassword,
      })
      .then((response) => {
        console.log("Registered:", response.data);
        // Handle successful registration, e.g., display success message
      })
      .catch((error) => {
        console.error("Registration error:", error);
        setLoginResponse(error.response.data); // Set the error response in state
      });
  };

  return (
    <div className="login-container"> 
      <div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label>Username:</label>
          <input
            className="login-input" 
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
          />
          <br />
          <label>Password:</label>
          <input
            className="login-input" 
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <br />
          <button className="login-button" type="submit">Login</button> 
        </form>
      </div>
      <div>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <label>Username:</label>
          <input
            className="register-input" 
            type="text"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
          />
          <br />
          <label>Password:</label>
          <input
            className="register-input" 
            type="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <br />
          <button className="register-button" type="submit">Register</button> 
        </form>
        {loginResponse && ( // Display response if available
          <div>
            <h3>Login Response:</h3>
            <p>{JSON.stringify(loginResponse)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
