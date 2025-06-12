import { useEffect, useState } from "react";
import { clientServer } from "../../config";
import DashboardLayout from "../../layout/DashboardLayout";
import UserLayout from "../../layout/UserLayout";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadResume,
  getConnectionsRequest,
  getMyConnectionRequests,
  sendConnectionRequest,
} from "../../config/redux/action/authAction";
import {
  getAllComments,
  getAllPosts,
  incrementPostLike,
  togglePostLike,
} from "../../config/redux/action/postAction";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCorruntUserInConnection, setIsCorruntUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState({});

    const currentUserId = authState.user?.userId?._id;


  const getUsersPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionsRequest({ token: localStorage.getItem("token") })
    );
    await dispatch(
      getMyConnectionRequests({ token: localStorage.getItem("token") })
    );
  };

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId && post.userId.username === router.query.username;
    });

    setUserPosts(post);
  }, [postReducer.posts]);

  useEffect(() => {
    // console.log(authState.connections, userProfile.userId._id);
    if (
      authState.connections.some(
        (user) => user.ConnectionId?._id === userProfile.userId?._id
      )
    ) {
      setIsCorruntUserInConnection(true);

      if (
        authState.connections.find(
          (user) => user.ConnectionId?._id === userProfile.userId?._id
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }
    if (
      authState.connectionRequest.some(
        (user) => user.userId?._id === userProfile.userId?._id
      )
    ) {
      setIsCorruntUserInConnection(true);
      if (
        authState.connectionRequest.find(
          (user) => user.userId?._id === userProfile.userId?._id
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }
  }, [authState.connections, authState.connectionRequest]);

  useEffect(() => {
    const viewedUserId = userProfile?.userId?._id;

    if (Array.isArray(authState.connections) && viewedUserId) {
      const match = authState.connections.find(
        (conn) => conn.connectionId?._id === viewedUserId
      );

      if (match) {
        setIsCorruntUserInConnection(true);
        setIsConnectionNull(!match.status_accepted); // true if pending
      } else {
        setIsCorruntUserInConnection(false);
        setIsConnectionNull(true);
      }
    }

    if (
      authState.connectionRequest.some(
        (user) => user.userId._id === userProfile.userId._id
      )
    ) {
      setIsCorruntUserInConnection(true);
      if (
        authState.connectionRequest.find(
          (user) => user.userId._id === userProfile.userId._id
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }
  }, [
    authState.connections,
    authState.connectionRequest,
    userProfile?.userId?._id,
  ]);

  useEffect(() => {
    getUsersPost();
  }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className="bg-gray-200 rounded-lg flex flex-col gap-3">
          <div className="p-3 bg-white flex rounded-lg flex-col gap-3">
            <div className="bg-white">
              <div className="">
                <div
                  className="w-full h-[25vh] relative rounded-[10px] bg-cover bg-no-repeat"
                  style={{
                    backgroundImage: `url("https://images.unsplash.com/photo-1506744038136-46273834b3fb")`,
                  }}
                >
                  <img
                    className="w-40 h-40 object-cover rounded-full absolute left-8 -bottom-[30%] border-4 border-white"
                    src={userProfile.userId.profilePicture}
                    alt="backdrop"
                  />
                </div>
              </div>
              <div className="pt-15">
                <div className="flex flex-col">
                  <div className="flex relative">
                    <div className="flex flex-col mb-2 w-fit">
                      <h2 className="font-semibold text-2xl">
                        {userProfile.userId.name}
                      </h2>
                      <p className="text-gray-600">
                        @{userProfile.userId.username}
                      </p>
                    </div>
                    <div className=" absolute right-0">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1.2rem",
                        }}
                        className="flex gap-5 ml-2 mb-2 items-center"
                      >
                        {isCorruntUserInConnection ? (
                          <button className={styles.connectedButton}>
                            {isConnectionNull ? "Pending" : "Connected"}
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              await dispatch(
                                sendConnectionRequest({
                                  token: localStorage.getItem("token"),
                                  user_id: userProfile.userId._id,
                                })
                              );
                              await dispatch(
                                getConnectionsRequest({
                                  token: localStorage.getItem("token"),
                                })
                              );
                            }}
                            className={styles.connectBtn}
                          >
                            Connect
                          </button>
                        )}
                        <div
                          // onClick={async () =>
                          //     {
                          //     const response = await clientServer.get(
                          //       `/user/download_resume?id=${userProfile.userId._id}`,
                          //       {
                          //         responseType: "blob", // Important to receive the PDF as binary
                          //       }
                          //     );
                          //     window.open(
                          //       `${BASE_URL}/${response.data.message}`,
                          //       "_blank"
                          //     );
                          //   }}

                          // }
                          onClick={() => {
                            dispatch(downloadResume(userProfile.userId._id));
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <svg
                            style={{ width: "1.2em" }}
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
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" mb-2">
                    <p className="font-medium">{userProfile.bio}</p>
                  </div>
                </div>
              </div>

              <div className={styles.workHistory}>
                <h2 className="font-semibold text-xl">Work History</h2>
                <div className={styles.workHistoryContainer}>
                  {userProfile.pastWork.map((work, index) => {
                    return (
                      <div key={index} className={styles.workHistoryCard}>
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
                        <p>{work.years}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-200">
            <div className="bg-white rounded-lg p-3 flex flex-col gap-3 min-h-screen">
              <h3 className="font-semibold text-2xl">Recent Activity</h3>
              <div className="grid grid-cols-1 gap-5 p-2 rounded-lg">
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
                            className="rounded-full size-[3.6rem] object-cover"
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
                        <div className="w-full">
                          {post.media !== "" ? (
                            <img
                              src={post.media}
                              className="h-[220px] w-full"
                              alt="postmedia"
                            />
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
                              {post.likes
                                ?.map(String)
                                .includes(currentUserId) ? (
                                // LIKE SVG (active)
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
                                    d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54"
                                  />
                                </svg>
                              ) : (
                                // DISLIKE SVG (inactive)
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
                              )}
                              <span className="ml-2">
                                {Array.isArray(post.likes)
                                  ? post.likes.length
                                  : 0}
                              </span>
                            </div>
                            <div
                              onClick={() => {
                                dispatch(getAllComments({ post_id: post._id }));
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
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  console.log(context.query.username);

  const request = await clientServer.get(
    "/user/get_profile_based_on_username",
    {
      params: {
        username: context.query.username,
      },
    }
  );
  const response = await request.data;
  console.log(response);

  return { props: { userProfile: request.data.profile } };
}
