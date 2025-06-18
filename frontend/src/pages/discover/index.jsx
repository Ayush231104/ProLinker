import { useEffect } from "react";
import UserLayout from "../../layout/UserLayout";
import DashboardLayout from "../../layout/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  getAboutUser,
  getAllUsers,
} from "../../config/redux/action/authAction";
import styles from "./styles.module.css";
import { useRouter } from "next/router";

export default function DiscoverPage() {
  const authState = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const router = useRouter();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
    dispatch(getAllUsers());
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  }, [authState.user]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className="bg-gray-200 ">
          <h1 className="bg-white mb-2 rounded-lg font-bold p-5 text-2xl">
            Discover
          </h1>

          <div className="bg-gray-100 rounded-lg grid sm:grid-cols-2 items-center p-3 gap-3 pb-10 sm:pb-5">
            {authState.all_profiles_fetched &&
              authState.all_users
                .filter(
                  (user) =>
                    user?.userId &&
                    user.userId._id !== authState?.user?.userId?._id
                )
                .map((user) => {
                  if (!user?.userId) return null;
                  return (
                    <div
                      key={user._id}
                      className="bg-white cursor-pointer sm:rounded-lg h-full flex p-3 flex-col gap-1"
                    >
                      <div
                        onClick={() => {
                          router.push(`/view_profile/${user.userId.username}`);
                        }}
                        style={{
                          backgroundImage: user?.userId?.backgroundPicture
                            ? `url(${user.userId.backgroundPicture})`
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
                        className={`relative rounded-lg bg-no-repeat w-full h-[80px] ${styles.discover_card}`}
                      >
                        <img
                          className=" absolute left-[7.5rem] sm:left-10 bottom-[-30px] sm:bottom-[-20px] rounded-full border-2 border-white size-[5rem] sm:size-[4rem] object-cover"
                          src={user.userId.profilePicture}
                          alt="Profile"
                        />
                      </div>
                      <div className="pt-6 gap-3">
                        <div className="">
                          <h2
                            onClick={() => {
                              router.push(
                                `/view_profile/${user.userId.username}`
                              );
                            }}
                            className="font-bold"
                          >
                            {user.userId.name}
                          </h2>
                          <p className="text-gray-500 text-sm">
                            @{user.userId.username}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 ">
                          <div className=" flex flex-col mr-auto ">
                            <h1 className="font-semibold">Experience</h1>
                            {user?.pastWork?.slice(0, 2).map((work, index) => {
                              return (
                                <div key={index} className="font-light text-sm">
                                  <p>
                                    {work.company} - {work.position}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          <div className=" flex flex-col mr-auto ">
                            <h1 className="font-semibold">Eductioan</h1>
                            {user?.education
                              ?.slice(0, 1)
                              .map((education, index) => {
                                return (
                                  <div
                                    key={index}
                                    className="font-light text-sm"
                                  >
                                    <p>
                                      {education.degree} -{" "}
                                      {education.fieldOfStudy}
                                    </p>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
