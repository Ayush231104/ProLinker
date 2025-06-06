import React, { useEffect } from 'react'
import UserLayout from '../../layout/UserLayout'
import DashboardLayout from '../../layout/DashboardLayout'
import styles from './styles.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { acceptConnection, getConnectionsRequest, getMyConnectionRequests } from '../../config/redux/action/authAction'
import { BASE_URL } from '../../config'
import { useRouter } from 'next/router'

export default function MyConnectionsPage() {

  const dispatch = useDispatch();

  const router = useRouter();

  const authState = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(getMyConnectionRequests({token: localStorage.getItem("token")}));
  },[])

  useEffect(() => {

    if(authState.connectionRequest.length !== 0){
      console.log(authState.connectionRequest)
    }

  },[authState.connectionRequest])

  return (
      <UserLayout>
        <DashboardLayout>
            <div className='flex flex-col gap-3'>
              <div className="flex flex-col gap-2">
                <h3 className='bg-white font-semibold text-2xl rounded-lg p-3'>My Connection</h3>
                {authState.connectionRequest.length == 0 && <h1 style={{padding:"5px"}}>No Connection Request Panding</h1>}
                {console.log(authState.connectionRequest.length)}
                {
                  authState.connectionRequest.length != 0
                  &&
                  authState.connectionRequest.filter((connection) => connection.status_accepted === null).map((user, index) => {
                    return(
                      <div onClick={()=>{
                        router.push(`/view_profile/${user.userId.username}`)
                      }} className="bg-white rounded-lg flex w-full p-3 mb-3 items-center shadow-lg" key={index}>
                        <div className='bg-white rounded-lg relative w-full ' style={{display: "flex", alignItems: "center", gap:"1.2rem", justifyContent: "space-between"}}>
                
                            <img className=' rounded-full size-15' src={user.userId.profilePicture} alt="" />
                
                          <div className={styles.userInfo}>
                            <h3 className='font-semibold'>{user.userId.name}</h3>
                            <p className='text-gray-500'>@{user.userId.username}</p>
                          </div>
                          <button onClick={async(e) => {
                            e.stopPropagation();
                            await dispatch(acceptConnection({
                              connectionId: user._id,
                              token: localStorage.getItem("token"),
                              action: "accept"
                            }))
                            await dispatch(getMyConnectionRequests({token: localStorage.getItem("token")}))
                            await dispatch(getConnectionsRequest({token: localStorage.getItem("token")}))
                          }} className={`${styles.connectedButton} absolute right-5`}>
                            Accept
                          </button>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
              <div className="flex flex-col gap-2">  
                <h4 className='bg-white font-semibold text-2xl rounded-lg p-3'>My Network</h4>
                {authState.connectionRequest.filter((connection) => connection.status_accepted !== null).map((user, index)=>{
                    return(
                      <div onClick={()=>{
                        router.push(`/view_profile/${user.userId.username}`)
                      }} className="bg-white flex items-center rounded-lg" key={index}>
                        <div className='bg-white rounded-lg p-3 flex justify-between items-center gap-5'>
  
                          <img className=' rounded-full size-15' src={user.userId.profilePicture} alt="" />
  
                          <div className="">
                            <h3 className='font-semibold'>{user.userId.name}</h3>
                            <p className='text-gray-500'>@{user.userId.username}</p>
                          </div>
                        </div>
                      </div>
                    )
                })}
              </div>
            </div>
        </DashboardLayout>
    </UserLayout>
  )
}
