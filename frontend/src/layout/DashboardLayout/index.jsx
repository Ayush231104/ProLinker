import React, { useEffect } from "react";
import styles from "./styles.module.css"
import { useRouter } from "next/router";
import { setTokenIsThere } from "../../config/redux/reducer/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

export default function DashboardLayout({children}) {

    const dispatch = useDispatch();

    const authState = useSelector((state) => state.auth); 
    const [userProfile, setUserProfile] = useState({})

    useEffect(()=> {
        if(localStorage.getItem('token') == null) {
            router.push('/login')
        }

        dispatch(setTokenIsThere());

          if (authState.user) {
            setUserProfile(authState.user);
        } 
    },[authState.user])

    const router = useRouter();
  return (
    <div className="flex items-center justify-center bg-gray-200">
      <div className="container">

        <div className="flex lg:mx-45">

            <div className="hidden sm:flex flex-3/10 flex-col h-fit rounded-md items-start border-r border-red-50 bg-white p-[10px] mt-3 shadow-lg">
                <div onClick={() => {
                    router.push('/profile')
                }} className={` cursor-pointer ${styles.backDropContainer}`}>
                    <img src={authState?.user?.userId?.profilePicture} alt="" />
                </div>

                <h1 className="font-semibold text-2xl pt-8">{authState?.user?.userId?.name}</h1>
                <h1 className="text-gray-500">@{authState?.user?.userId?.username}</h1>
                <h1 className="font-semibold pt-2">Experience</h1>
                {
                    userProfile?.pastWork?.map((work, index) => {
                        return (
                        <div key={index} className="font-light text-sm">
                            <p>{work.company} - {work.position}</p>
                        </div>
                        )
                    })
                }
                <h1 className="font-semibold pt-2">Education</h1>
                {
                    userProfile?.education?.map((educ, index) => {
                        return (
                        <div key={index} className="font-light text-sm">
                            <p className="">{educ.school}</p>
                            <p className="">{educ.degree}</p>
                        </div>
                        )
                    })
                }
            </div>

            <div className="bg-gray-200 rounded-lg h-fit my-3 lg:mx-4 flex-3/5">
                {children}
            </div>

            <div className="hidden sm:flex sm:flex-3/10 flex-col py-[5px] pl-[20px] pr-[5px] mt-3 ml-0 mr-2.5 bg-white h-[88vh] rounded-md border-l border-red-50 shadow-lg">
                <h2 className="font-semibold text-xl ">Top Profiles</h2>
                {authState.all_profiles_fetched && authState.all_users
                    .map((profile) => {
                        if (!profile.userId) return null;
                        return (
                            <div key={profile._id} className={styles.extraContainer_profile}>
                                <p>{profile.userId.name}</p>
                            </div>
                        )
                })}
            </div>
        </div>

      </div>

      <div className={styles.mobileNavbarView}>
            <div onClick={()=>{
                    router.push('/dashboard')

                }} className={styles.singleNavItemHolder_mobileView}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
            </div>
            <div onClick={()=>{
                    router.push('/discover')

                }} className={styles.singleNavItemHolder_mobileView}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
            </div>
            <div onClick={()=>{
                    router.push('/my_connections')

                }}  className={styles.singleNavItemHolder_mobileView}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
            </div>
      </div>
    </div>
  );
}
