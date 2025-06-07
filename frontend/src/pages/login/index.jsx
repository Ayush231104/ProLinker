import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import styles from "./styles.module.css";
import { loginUser, registerUser } from "../../config/redux/action/authAction";
import { emptyMessage } from "../../config/redux/reducer/authReducer";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);

  const router = useRouter();

  const dispatch = useDispatch();

  const [userLoginMethod, setUserLoginMethod] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  },[authState.loggedIn]);

  useEffect(() => {
    if(localStorage.getItem("token")){
      router.push("/dashboard");
    }
  },[])

  useEffect(() => {
    dispatch(emptyMessage())
  },[userLoginMethod])

  const handleRegister = () =>{
    console.log("Registring...");
    dispatch(registerUser({username, name, email, password}))
  }

  const handleLogin = () =>{
    console.log("Login...");
    dispatch(loginUser({email, password}))
  }

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer_left}>
            <p className={styles.cardLeft_heading}>
              {userLoginMethod ? "Sign In" : "Sign Up"}
            </p>
            <div className={styles.inputContainer}>
              
              {!userLoginMethod && <div className={styles.inputRow}>
                <input onChange={(e) => setName(e.target.value)} 
                  className={styles.inputField} type="text" placeholder="Full Name" />
                <input onChange={(e) => setUsername(e.target.value)} className={styles.inputField} type="text" placeholder="Username"/>
              
              </div>}
              <input onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    userLoginMethod ? handleLogin() : handleRegister();  
                  }
                }}
                className={styles.inputField} type="text" placeholder="Email"/>
              
              <input onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    userLoginMethod ? handleLogin() : handleRegister();  
                  }
                }}
                className={styles.inputField} type="password" placeholder="Password"/>

              <p style={{color: authState.isError ? "red" : "Green"}}>{authState.message?.message || authState.message}</p>
              <div onClick={() => {
                if(userLoginMethod){
                  handleLogin();
                }else{
                  handleRegister();
                }
              }} className={styles.buttonWithOutline}>
                <p>{userLoginMethod ? "Sign In" : "Sign Up"}</p>
              </div>


              <div style={{display:"flex"}}>
              {userLoginMethod ? <p>Don't Have an Account?</p>: <p>Alread Have an Account?</p>}
              <div onClick={() => {
                setUserLoginMethod(!userLoginMethod);
              }} className={styles.link}>
                <p style={{marginInline:"10px", color:"#074893", cursor:"pointer"}}>{userLoginMethod ? "Sign Up" : "Sign In"}</p>
              </div>
              </div>
            </div>
          </div>

          <div className={styles.cardContainer_right}>
              <img className={styles.rightImage} src="/images/imgLogin.png" alt="" />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;
