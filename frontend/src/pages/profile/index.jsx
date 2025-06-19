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
  deleteComment,
  deletePost,
  getAllComments,
  getAllPosts,
  incrementPostLike,
  postComment,
  togglePostLike,
} from "../../config/redux/action/postAction";
import { useRouter } from "next/router";
import {
  resetPostId,
  setSelectedPostId,
} from "../../config/redux/reducer/postReducer";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.postReducer);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const currentUserId = authState.user?.userId?._id;

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
  const updateBackgroundPicture = async (file) => {
    const formData = new FormData();
    formData.append("background_picture", file);
    formData.append("token", localStorage.getItem("token"));

    const response = await clientServer.post(
      "/update_background_picture",
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

  const handleSubmitComment = async () => {
    if (commentText.trim() === "") return;

    dispatch(getAllComments({ post_id: postReducer.selectedPostId }));
    setCommentText("");
    await dispatch(
      postComment({
        post_id: postReducer.selectedPostId,
        body: commentText,
      })
    );
    dispatch(getAllComments({ post_id: postReducer.selectedPostId }));
  };

  return (
    <UserLayout>
      <div className="bg-gray-200 flex gap-6 lg:px-45 pt-3">
        <div className="bg-gray-200 flex flex-7/10 w-full">
          <div className="flex flex-col gap-3 w-full">
            {authState.user && userProfile.userId && (
              <div className="bg-white rounded-lg flex flex-col p-3">
                <div className="">
                  <div
                    style={{
                      backgroundImage: userProfile.userId.backgroundPicture
                        ? `url(${userProfile.userId.backgroundPicture})`
                        : "none",
                      backgroundColor: !userProfile.userId.backgroundPicture
                        ? "#f3f4f6"
                        : undefined, // fallback color
                      height: "25vh",
                      backgroundSize: "cover",
                    }}
                    className="w-full h-[25vh] bg-no-repeat relative rounded-[10px]"
                  >
                    <label
                      htmlFor="backgroundPictureUpload"
                      className="absolute top-4 right-4 px-4 py-2 rounded bg-black bg-opacity-60 text-white cursor-pointer z-20 hover:bg-opacity-80 transition-all duration-400"
                    >
                      Edit Background
                    </label>
                    <input
                      onChange={(e) => {
                        updateBackgroundPicture(e.target.files[0]);
                      }}
                      style={{ display: "none" }}
                      type="file"
                      name="background_picture"
                      id="backgroundPictureUpload"
                      accept="image/*"
                    />

                    <label
                      htmlFor="profilePictureUpload"
                      className="size-[8rem] sm:size-[11rem] rounded-full absolute bottom-[-30%] left-[8%] border-[4px] border-white z-10 cursor-pointer text-white opacity-0 flex items-center justify-center font-medium hover:bg-black hover:opacity-60 transition-all duration-400"
                    >
                      <p>Edit</p>
                    </label>
                    <input
                      onChange={(e) => {
                        updateProfilePicture(e.target.files[0]);
                      }}
                      style={{ display: "none" }}
                      type="file"
                      name="profile_picture"
                      id="profilePictureUpload"
                    />
                    <img
                      src={userProfile.userId.profilePicture}
                      alt="backdrop"
                      className="size-[8rem] sm:size-[11rem] rounded-full absolute bottom-[-30%] left-[8%] border-[4px] border-white"
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
                              placeholder="Skill || About Yourself ..."
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
                              className="w-full border border-gray-300 rounded-md px-4 py-2 font-[Poppins] text-base resize-none focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                          <div
                            key={index}
                            className={`shadow-lg ${styles.workHistoryCard}`}
                          >
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
                            className={`shadow-lg ${styles.workHistoryCard}`}
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
                className="fixed top-0 left-0 w-screen h-screen z-50 bg-black/70 flex justify-center items-center"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-[90vw] sm:w-[40vw] bg-white rounded-[10px] relative p-6 flex flex-col gap-5"
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
                className="fixed top-0 left-0 w-screen h-screen z-50 bg-black/70 flex justify-center items-center"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-[90vw] sm:w-[40vw] bg-white rounded-[10px] relative p-6 flex flex-col gap-5"
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
                      <div
                        key={post._id}
                        className="bg-white rounded-lg shadow-xl border border-gray-300"
                      >
                        <div
                          className={` flex flex-col ${styles.singleCard_profileContainer}`}
                        >
                          <div className="flex relative gap-5 w-full px-5 py-3">
                            <img
                              className="rounded-full size-[4rem] object-cover"
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
                            {post?.userId?._id ===
                              authState.user?.userId?._id && (
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
                              {expandedPosts[post._id]
                                ? post.body
                                : `${post.body.slice(0, 100)}${
                                    post.body.length > 100 ? "..." : ""
                                  }`}
                              {post.body.length > 100 && (
                                <button
                                  onClick={() =>
                                    setExpandedPosts((prev) => ({
                                      ...prev,
                                      [post._id]: !prev[post._id],
                                    }))
                                  }
                                  style={{
                                    marginLeft: "0.5rem",
                                    color: "blue",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  {expandedPosts[post._id]
                                    ? "see less"
                                    : "see more..."}
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
                                    togglePostLike({
                                      post_id: post._id,
                                      user_id: currentUserId,
                                    })
                                  );
                                  dispatch(getAllPosts());
                                }}
                                className="flex items-center cursor-pointer hover:text-sky-500 hover:scale-105 transition-transform duration-200"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill={
                                    post.likes
                                      ?.map(String)
                                      .includes(currentUserId)
                                      ? "#0284c7"
                                      : "none"
                                  }
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke={
                                    post.likes
                                      ?.map(String)
                                      .includes(currentUserId)
                                      ? "#0284c7"
                                      : "currentColor"
                                  }
                                  className="size-6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                                  />
                                </svg>
                                <span className="ml-2">
                                  {Array.isArray(post.likes)
                                    ? post.likes.length
                                    : 0}
                                </span>
                              </div>

                              <div
                                onClick={() => {
                                  dispatch(resetPostId());
                                  dispatch(setSelectedPostId(post._id));
                                  dispatch(
                                    getAllComments({ post_id: post._id })
                                  );
                                }}
                                className="flex items-center cursor-pointer hover:text-sky-500 hover:scale-105 transition-transform duration-200"
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
                                className="flex items-center cursor-pointer hover:text-sky-500 hover:scale-105 transition-transform duration-200"
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
        {postReducer.selectedPostId !== "" && (
          <div
            onClick={() => {
              dispatch(resetPostId());
            }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60`}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="relative bg-white rounded-lg w-[40vw] min-h-[40svh] max-w-[1120px] h-[80vh] p-6 flex flex-col"
            >
              <h2 className="text-lg font-bold mb-4">Comments</h2>
              {(!postReducer.commentsByPostId[postReducer.selectedPostId] ||
                postReducer.commentsByPostId[postReducer.selectedPostId]
                  .length === 0) && (
                <h2 className="text-gray-500 py-8 text-center">No Comments</h2>
              )}

              <div
                className={`flex-1 overflow-y-auto space-y-4 pr-2 pb-20 hide-scrollbar`}
              >
                {postReducer.commentsByPostId[postReducer.selectedPostId]
                  ?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {postReducer.commentsByPostId[
                      postReducer.selectedPostId
                    ].map((comment) => {
                      let user = comment.userId;
                      // If userId is just an ID, find the user in allUsers
                      if (typeof user === "string" && authState.allUsers) {
                        user = authState.allUsers.find((u) => u._id === user);
                      }
                      return (
                        <div
                          className="shadow-lg rounded-lg flex flex-col h-fit gap-3"
                          key={comment._id}
                        >
                          <div className="flex items-start gap-3 bg-gray-50 p-2 rounded-lg">
                            <img
                              className="rounded-full size-10 object-cover"
                              src={comment.userId.profilePicture}
                              alt=""
                            />
                            <div>
                              <p className="font-semibold text-sm">
                                {comment.userId.name}
                              </p>
                              <p className="text-gray-600 text-xs">
                                @{comment.userId.username}
                              </p>
                              <div>
                                <p className="mt-1 text-sm">{comment.body}</p>
                              </div>
                              {comment.userId._id ===
                                authState.user?.userId?._id && (
                                <button
                                  onClick={async () => {
                                    await dispatch(
                                      deleteComment({
                                        comment_id: comment._id,
                                        post_id: postReducer.selectedPostId,
                                      })
                                    );
                                    await dispatch(
                                      getAllComments(postReducer.selectedPostId)
                                    );
                                  }}
                                  className="text-red-500 text-xs"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="absolute bottom-5 left-5 w-[90%] flex items-center justify-center gap-5">
                <input
                  type="text"
                  value={commentText}
                  className="flex-[0.9] px-6 py-4 border-none outline-none bg-gray-200 rounded-lg focus:border focus:border-gray-300"
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await handleSubmitComment();
                    }
                  }}
                  placeholder="Comment"
                />
                <div
                  onClick={handleSubmitComment}
                  className="flex-[0.1] w-fit px-4 py-4 bg-[#311c1c] rounded-lg text-center text-[aliceblue] cursor-pointer"
                >
                  <p>Comment</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-gray-200  hidden sm:flex flex-col flex-2/10 w-full rounded-lg">
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
                        if (user?.userId?._id == userProfile.userId?._id)
                          return false;
                        // Check if any of their schools match current user's schools
                        return user.education.some((edu) =>
                          currentUserSchools.includes(edu.school?.toLowerCase())
                        );
                      })
                      .slice(0, 10)
                      .map((user) => {
                        return (
                          <div
                            onClick={() => {
                              router.push(
                                `/view_profile/${user?.userId?.username}`
                              );
                            }}
                            key={user._id}
                            className="bg-white rounded-lg flex w-full items-center justify-start p-5 gap-5 cursor-pointer"
                          >
                            <img
                              className="rounded-full size-[3.6rem] "
                              src={user?.userId?.profilePicture}
                              alt="Profile"
                            />
                            <div>
                              <h2 className="font-semibold">
                                {user?.userId?.name}
                              </h2>
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
    </UserLayout>
  );
}
