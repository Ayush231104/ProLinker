import React from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";

export default function NavBarComponent() {
  const router = useRouter();

  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  return (
    <div className="p-5 shadow-xl w-full">
      <nav className="flex items-center justify-between lg:mx-13">
        <h1
         
          onClick={() => {
            router.push("/");
          }}
          className=" text-xl sm:text-xl md:text-2xl font-extrabold cursor-pointer"
        >
          Pro Linker
        </h1>

        <div className={styles.navBarOptionContainer}>
          {authState.profileFetched && 
            <div className="flex gap-4 font-bold cursor-pointer text-lg md:text-xl">
              {/* <p>Hey, {authState.user.userId.name}</p> */}
              
              <p onClick={()=>{
                router.push("/profile");
              }}  >Profile</p>
              
              <p onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
                dispatch(reset());
              }} >Logout</p>
            
            </div>
          }
          {!authState.profileFetched && 
            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              <p>Be a part</p>
            </div>
          }
          
        </div>
      </nav>
    </div>
  );
}
