import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth hook
import "../styles/Login.css"; // Import CSS file

function Login() {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginResponse, setLoginResponse] = useState(null); // State to store login response
  const navigate = useNavigate(); // Initialize navigate function from useNavigate hook
  const { login } = useAuth(); // Destructure login from useAuth

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent default form submission
    axios
      .post("http://localhost:3000/auth/login", {
        username: loginUsername,
        password: loginPassword,
      })
      .then((response) => {
        setLoginResponse(response.data); // Set the response in state
        login(loginUsername); // Call the login function from AuthContext
        navigate("/room-selection"); // Navigate to room-selection upon successful login
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
    <div className="login-main">
      <div className="login-container">
        <div>
          <h2>Login</h2>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="f-container">
              <div className="label-div">
                <label>Username:</label>
              </div>
              <input
                className="input"
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
              <br />
            </div>
            <div className="f-container">
              <div className="label-div">
                <label>Password:</label>
              </div>
              <input
                className="input"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <br />
            </div>
            <button className="login-button" type="submit">
              Login
            </button>
          </form>
        </div>
        <div>
          <h2>Register</h2>
          <form className="register-form" onSubmit={handleRegister}>
            <div className="f-container">
              <div className="label-div">
                <label>Username:</label>
              </div>
              <input
                className="input"
                type="text"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
              />
              <br />
            </div>
            <div className="f-container">
              <div className="label-div">
                <label>Password:</label>
              </div>
              <input
                className="input"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <br />
            </div>
            <button className="register-button" type="submit">
              Register
            </button>
          </form>
          </div>
          </div>
          {loginResponse && ( // Display response if available
            <div className="login-response">
              <h3>Login Response:</h3>
              <p>{JSON.stringify(loginResponse)}</p>
            </div>
          )}
    </div>
  );
}

export default Login;
