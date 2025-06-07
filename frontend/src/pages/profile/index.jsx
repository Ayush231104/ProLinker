import React, { useEffect, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  getAboutUser,
  getAllUsers,
} from "../../config/redux/action/authAction";
import styles from "./styles.module.css";
import { clientServer } from "../../config";
import {
  deletePost,
  getAllComments,
  getAllPosts,
  incrementPostLike,
} from "../../config/redux/action/postAction";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.postReducer);
  const [showFull, setShowFull] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);

  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });
  const [educationData, setEductionData] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
  });

  const handleWorkInputChange = (e) => {
    const { name, value } = e.target;

    setInputData({ ...inputData, [name]: value });
  };

  const handleEducationInputChange = (e) => {
    const { name, value } = e.target;

    setEductionData({ ...educationData, [name]: value });
  };

  // Remove a work entry by index
  const handleDeleteWork = (index) => {
    const updatedWork = userProfile.pastWork.filter((_, i) => i !== index);
    setUserProfile({
      ...userProfile,
      pastWork: updatedWork,
    });
  };

  // Remove an education entry by index
  const handleDeleteEducation = (index) => {
    const updatedEducation = userProfile.education.filter(
      (_, i) => i !== index
    );
    setUserProfile({
      ...userProfile,
      education: updatedEducation,
    });
  };

  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(getAllPosts());

    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, []);

  useEffect(() => {
    if (authState.user != undefined) {
      setUserProfile(authState.user);

      let post = postReducer.posts.filter((post) => {
        return (
          post.userId && post.userId.username === authState.user.userId.username
        );
      });
      setUserPosts(post);
    }
  }, [authState.user, postReducer.posts]);

  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));

    const response = await clientServer.post(
      "/update_profile_picture",
      formData,
      {
        //const response = after removing this it steel work
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const updateProfileData = async () => {
    const request = await clientServer.post("/user_update", {
      token: localStorage.getItem("token"),
      name: userProfile.userId.name,
    });

    const response = await clientServer.post("/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      pastWork: userProfile.pastWork,
      education: userProfile.education,
    });

    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const currentUserSchools =
  authState.user?.education?.map((edu) => edu.school?.toLowerCase()) || [];


  return (
    <UserLayout>
      <div className="bg-gray-200 flex gap-6 lg:px-45 pt-3">
        <div className="bg-gray-200 flex flex-7/10 w-full">
          <div className="flex flex-col gap-3">
            {authState.user && userProfile.userId && (
              <div className="bg-white rounded-lg flex flex-col p-3">
                <div className="">
                  <div className={styles.backDropContainer}>
                    <label
                      htmlFor="profilePictureUpload"
                      className={styles.backDrop_overlay}
                    >
                      <p>Edit</p>
                    </label>
                    <input
                      onChange={(e) => {
                        updateProfilePicture(e.target.files[0]);
                      }}
                      style={{ display: "none" }}
                      type="file"
                      name="profilePicture"
                      id="profilePictureUpload"
                    />
                    <img
                      src={userProfile.userId.profilePicture}
                      alt="backdrop"
                    />
                  </div>
                  <div className="">
                    <div className="p-5 pt-15">
                      <div className="">
                        <div style={{ flex: "0.8" }}>
                          <div
                            style={{
                              display: "flex",
                              width: "fit-content",
                              gap: "0.2rem",
                            }}
                            className="flex-col"
                          >
                            <input
                              type="text"
                              className={styles.nameEdit}
                              value={userProfile.userId.name}
                              onChange={(e) => {
                                setUserProfile({
                                  ...userProfile,
                                  userId: {
                                    ...userProfile.userId,
                                    name: e.target.value,
                                  },
                                });
                              }}
                            />
                            <p className="text-gray-500">
                              @{userProfile.userId.username}
                            </p>
                          </div>

                          <div>
                            <textarea
                              name="text"
                              value={userProfile.bio}
                              onChange={(e) => {
                                setUserProfile({
                                  ...userProfile,
                                  bio: e.target.value,
                                });
                              }}
                              rows={Math.max(
                                3,
                                Math.ceil(userProfile.bio.length / 80)
                              )} //adjust as needed
                              style={{ width: "100%" }}
                              id=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5">
                    <h2 className="font-semibold text-2xl">Work History</h2>
                    <div className={styles.workHistoryContainer}>
                      {userProfile.pastWork.map((work, index) => {
                        return (
                          <div key={index} className={styles.workHistoryCard}>
                            <div className=" relative">
                              <p
                                style={{
                                  fontWeight: "bold",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.8rem",
                                }}
                              >
                                {work.company} - {work.position}
                              </p>
                              <p>Years of ex. - {work.years}</p>
                              <button
                                onClick={() => handleDeleteWork(index)}
                                className="absolute text-red-500 top-0 right-[-30px]"
                                title="Delete Work"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className=" size-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        className={`${styles.addWorkButton} h-[50px] shadow-lg mt-4 bg-blue-700 hover:bg-blue-900 text-white font-semibold `}
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
                      >
                        Add Work
                      </button>
                    </div>
                    <h2 className="font-semibold text-2xl mt-5">Education</h2>
                    <div className={styles.workHistoryContainer}>
                      {userProfile.education.map((education, index) => {
                        return (
                          <div
                            key={index}
                            className={`${styles.workHistoryCard}`}
                          >
                            <div className="relative">
                              <p
                                style={{
                                  fontWeight: "bold",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {education.school}
                              </p>
                              <p>
                                {education.degree} - {education.fieldOfStudy}
                              </p>
                              <button
                                onClick={() => handleDeleteEducation(index)}
                                title="Delete Education"
                                className="absolute text-red-500 top-0 right-[-30px]"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className=" size-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        className={`${styles.addWorkButton} h-[50px] shadow-lg mt-4 bg-blue-700 hover:bg-blue-900 text-white font-semibold `}
                        onClick={() => {
                          setIsEducationModalOpen(true);
                        }}
                      >
                        Add Eductioan
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 px-5">
                    {userProfile != authState.user && (
                      <div
                        onClick={() => {
                          updateProfileData();
                        }}
                        className={`${styles.updateProfileBtn}`}
                      >
                        Update Profile
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {isModalOpen && (
              <div
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className={styles.commentsContainer}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={styles.allCommentsContainer}
                >
                  <input
                    onChange={handleWorkInputChange}
                    name="company"
                    className={styles.inputField}
                    type="text"
                    placeholder="Enter company"
                  />
                  <input
                    onChange={handleWorkInputChange}
                    name="position"
                    className={styles.inputField}
                    type="text"
                    placeholder="Enter position"
                  />
                  <input
                    onChange={handleWorkInputChange}
                    name="years"
                    className={styles.inputField}
                    type="number"
                    placeholder="Years"
                  />
                  <div
                    onClick={() => {
                      setUserProfile({
                        ...userProfile,
                        pastWork: [...userProfile.pastWork, inputData],
                      });
                      setIsModalOpen(false);
                    }}
                    className={styles.updateProfileBtn}
                  >
                    Add Work
                  </div>
                </div>
              </div>
            )}
            {isEducationModalOpen && (
              <div
                onClick={() => {
                  setIsEducationModalOpen(false);
                }}
                className={styles.commentsContainer}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={styles.allCommentsContainer}
                >
                  <input
                    onChange={handleEducationInputChange}
                    name="school"
                    className={styles.educationData}
                    type="text"
                    placeholder="Enter School or Collage"
                  />
                  <input
                    onChange={handleEducationInputChange}
                    name="degree"
                    className={styles.educationData}
                    type="text"
                    placeholder="Enter Degree"
                  />
                  <input
                    onChange={handleEducationInputChange}
                    name="fieldOfStudy"
                    className={styles.educationData}
                    type="text"
                    placeholder="Field of Study"
                  />
                  <div
                    onClick={() => {
                      setUserProfile({
                        ...userProfile,
                        education: [...userProfile.education, educationData],
                      });
                      setIsEducationModalOpen(false);
                    }}
                    className={styles.updateProfileBtn}
                  >
                    Add Education
                  </div>
                </div>
              </div>
            )}
            <div className="bg-gray-200">
              <div className="bg-white rounded-lg p-3 flex flex-col gap-3 min-h-screen">
                <h3 className="font-semibold text-2xl">Recent Activity</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-2 rounded-lg">
                  {userPosts.map((post) => {
                    return (
                      // <div key={post._id} className="">
                      //   <div className="border border-gray-300 shadow-xl shadow-gray-300 rounded-lg  items-center gap-2">
                      //     <div className="flex flex-col">
                      //       <p className='flex p-2'>{post.body}</p>
                      //       {post.media !== "" ?
                      //         <img src={post.media} alt="post" className='' />
                      //         :
                      //         <div style={{width:"3.4rem", height:"3.4rem"}}></div>
                      //       }
                      //     </div>

                      //   </div>
                      // </div>
                      <div
                        key={post._id}
                        className="bg-white rounded-lg shadow-xl border border-gray-300"
                      >
                        <div
                          className={` flex flex-col ${styles.singleCard_profileContainer}`}
                        >
                          <div className="flex relative gap-5 w-full px-5 py-3">
                            <img
                              className="rounded-full size-15"
                              src={post?.userId?.profilePicture}
                              alt=""
                            />

                            <div className="flex flex-col ">
                              <p style={{ fontWeight: "bold" }}>
                                {post?.userId?.name}
                              </p>

                              <p style={{ color: "gray" }}>
                                @{post?.userId?.username}
                              </p>
                            </div>
                            {post?.userId?._id === authState.user?.userId?._id && (
                              <div
                                onClick={async () => {
                                  await dispatch(deletePost(post._id));
                                  await dispatch(getAllPosts());
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                <svg
                                  style={{ height: "1.3em", color: "red" }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className=" absolute right-5 size-6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="px-4 pb-1">
                              {showFull
                                ? post.body
                                : `${post.body.slice(0, 100)}${
                                    post.body.length > 100 ? "..." : ""
                                  }`}
                              {post.body.length > 100 && (
                                <button
                                  onClick={() => setShowFull(!showFull)}
                                  style={{
                                    marginLeft: "0.5rem",
                                    color: "blue",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  {showFull ? "see less" : "see more..."}
                                </button>
                              )}
                            </p>
                          </div>
                          <div className={`${styles.singleCard_image}`}>
                            {post.media !== "" ? (
                              <img src={post.media} alt="postmedia" />
                            ) : (
                              <></>
                            )}
                          </div>

                          <div className="">
                            <div className="flex justify-between py-2 items-center px-15">
                              <div
                                onClick={async () => {
                                  await dispatch(
                                    incrementPostLike({ post_id: post._id })
                                  );
                                  dispatch(getAllPosts());
                                }}
                                className={`${styles.singleOption_optionsContainer} flex`}
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
                                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                                  />
                                </svg>
                                <p className="pl-2">{post.likes}</p>
                              </div>

                              <div
                                onClick={() => {
                                  dispatch(
                                    getAllComments({ post_id: post._id })
                                  );
                                }}
                                className={styles.singleOption_optionsContainer}
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
                                    d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                                  />
                                </svg>
                              </div>

                              <div
                                onClick={() => {
                                  const text = encodeURIComponent(post.body);
                                  const url =
                                    encodeURIComponent("apanacolage.in");

                                  const twitterUrl = `https://twitter.com/AyushShadow?${text}&url=${url}`;
                                  window.open(twitterUrl, "_blank");
                                }}
                                className={styles.singleOption_optionsContainer}
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
                                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-200 flex flex-col flex-2/10 w-full rounded-lg">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col bg-white rounded-lg w-full h-fit ">
              <div className="flex flex-col bg-white p-3 rounded-t-lg ">
                <h1 className="font-semibold">Profile language</h1>
                <p>English</p>
              </div>
              <div className="bg-gray-500 h-[0.5px] mx-3"></div>
              <div className="flex flex-col bg-white p-3 rounded-b-lg">
                <h1 className="font-semibold">Public profile & URL</h1>
                <a
                  src="https://pro-linker-lovat.vercel.app/profil"
                  className=""
                >
                  https://pro-linker-lovat.vercel.app/profile
                </a>
              </div>
            </div>

            <div className="flex flex-col bg-white rounded-lg">
              <div>
                <h3 className="font-semibold p-3">People you may know</h3>
                <div className=" max-w-full flex items-center flex-col gap-3">
                  {authState.all_profiles_fetched &&
                    authState.all_users
                      .filter((user) => {
                        if (!user?.userId || !user.education) return false;
                        if(user?.userId?._id == userProfile.userId?._id) return false;
                        // Check if any of their schools match current user's schools
                        return user.education.some((edu) =>
                          currentUserSchools.includes(edu.school?.toLowerCase())
                        );
                      })
                      .map((user) => {
                        return (
                          <div
                            onClick={() => {
                              router.push(
                                `/view_profile/${user?.userId?.username}`
                              );
                            }}
                            key={user._id}
                            className="bg-white rounded-lg flex w-full items-center justify-start p-5 gap-5"
                          >
                            <img
                              className="rounded-full size-15 "
                              src={user?.userId?.profilePicture}
                              alt="Profile"
                            />
                            <div>
                              <h2 className="font-semibold">{user?.userId?.name}</h2>
                              <p>{user?.userId?.username}</p>
                            </div>

                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
