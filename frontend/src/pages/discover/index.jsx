import { useEffect } from 'react'
import UserLayout from '../../layout/UserLayout'
import DashboardLayout from '../../layout/DashboardLayout'
import { useDispatch, useSelector } from 'react-redux'
import { getAllUsers } from '../../config/redux/action/authAction';
import styles from "./styles.module.css"
// import { BASE_URL } from '../../config';
import { useRouter } from 'next/router';

export default function DiscoverPage() {

    const authState = useSelector((state) => state.auth);

    const dispatch = useDispatch();

    const router = useRouter();

    useEffect(()=>{
        if(!authState.all_profiles_fetched){
            dispatch(getAllUsers());
        }
    },[])

  return (
    <UserLayout>
        <DashboardLayout>
            <div className='bg-gray-200 '>
            <h1 className='bg-white mb-3 rounded-lg font-bold p-5 text-2xl'>Discover</h1>

            <div className=" max-w-full flex items-center flex-col gap-3">

                {authState.all_profiles_fetched && authState.all_users.map((user) => {
                    if (!user?.userId) return null;
                    return (
                        <div onClick={()=>{
                            router.push(`/view_profile/${user.userId.username}`)
                        }} key={user._id} className="bg-white rounded-lg flex w-full items-center justify-start p-5 gap-5">
                            <img className="rounded-full size-15" src={user.userId.profilePicture} alt="Profile" />
                            <div>
                                <h2 className='font-bold'>{user.userId.name}</h2>
                                <p>@{user.userId.username}</p>
                            </div>
                            <div>
                                <h1 className='font-semibold'>Bio</h1>
                                <h2>{user.bio}</h2>
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
