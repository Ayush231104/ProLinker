import { useEffect } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { setTokenIsThere } from "../../config/redux/reducer/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const [userProfile, setUserProfile] = useState({});

  useEffect(() => {
    if (localStorage.getItem("token") == null) {
      router.push("/login");
    }

    dispatch(setTokenIsThere());

    if (authState.user) {
      setUserProfile(authState.user);
    }
  }, [authState.user]);

  const router = useRouter();
  return (
    <div className="flex justify-center bg-gray-200 h-full ">
      <div className="container">
        <div className="flex lg:mx-[12vw]">
          <div className="hidden sm:flex flex-3/10 flex-col h-fit rounded-lg items-start border-r border-red-50 bg-white p-[10px] mt-3 shadow-lg">
            <div
              onClick={() => {
                router.push("/profile");
              }}
              style={{
                backgroundImage: authState?.user?.userId?.backgroundPicture
                  ? `url(${authState.user.userId.backgroundPicture})`
                  : "none",
                backgroundSize: "cover", // or "contain" if you want to see the whole image
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "100%",
                height: "5.5rem", // ensure height is set for the background to show
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className={` cursor-pointer ${styles.backDropContainer} rounded-lg`}
            >
              <img
                className="size-[5.5rem]"
                src={authState?.user?.userId?.profilePicture}
                alt=""
              />
            </div>

            <h1 className="font-semibold text-2xl pt-8">
              {authState?.user?.userId?.name}
            </h1>
            <h1 className="text-gray-500">
              @{authState?.user?.userId?.username}
            </h1>
            <h1 className="font-semibold pt-2">Experience</h1>
            {userProfile?.pastWork?.slice(0, 2).map((work, index) => {
              return (
                <div key={index} className="font-light text-sm">
                  <p>
                    {work.company} - {work.position}
                  </p>
                </div>
              );
            })}
            <h1 className="font-semibold pt-2">Education</h1>
            {userProfile?.education?.slice(0, 1).map((education, index) => {
              return (
                <div key={index} className="font-light text-sm">
                  <p className="">{education.school}</p>
                  <p className="">
                    {education.degree} - {education.fieldOfStudy}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-200 sm:rounded-lg h-fit my-3 lg:mx-4 flex-3/5">
            {children}
          </div>

          <div className="hidden sm:flex sm:flex-3/10 flex-col py-[5px] pb-3 pl-2 pr-[5px] mt-3 ml-0 mr-2.5 bg-white h-fit rounded-md border-l border-red-50 shadow-lg">
            <h2 className="font-semibold text-xl ">Top Profiles</h2>
            {authState.all_profiles_fetched &&
              authState.all_users
                .filter(
                  (user) =>
                    user?.userId &&
                    user.userId._id !== authState?.user?.userId?._id
                )
                .slice(0, 10)
                .map((user) => {
                  if (!user.userId) return null;
                  return (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-3 shadow-lg rounded-lg"
                    >
                      <div
                        onClick={() => {
                          router.push(`/view_profile/${user.userId.username}`);
                        }}
                        className="pt-4 cursor-pointer"
                      >
                        <img
                          className=" rounded-full border-2 border-white size-12 object-cover"
                          src={user.userId.profilePicture}
                          alt="Profile"
                        />
                      </div>
                      <div>
                        <p>{user.userId.name}</p>
                        <p className="text-sm text-gray-500">
                          @{user.userId.username}
                        </p>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-12 bg-white flex justify-around items-center z-50 md:hidden">
        <div
          onClick={() => {
            router.push("/dashboard");
          }}
          className={`flex flex-col items-center justify-center cursor-pointer`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
          <p className="text-sm">Home</p>
        </div>
        <div
          onClick={() => {
            router.push("/discover");
          }}
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
              clipRule="evenodd"
            />
            <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
          </svg>
          <p className="text-sm">Discover</p>
        </div>
        <div
          onClick={() => {
            router.push("/my_connections");
          }}
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
            <path
              fillRule="evenodd"
              d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0l.002.1a2.25 2.25 0 1 1-4.5 0Z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm">Connections</p>
        </div>
      </div>
    </div>
  );
}
