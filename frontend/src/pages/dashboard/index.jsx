import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPost,
  deleteComment,
  deletePost,
  getAllComments,
  getAllPosts,
  // incrementPostLike,
  postComment,
  togglePostLike,
} from "../../config/redux/action/postAction";
import {
  getAboutUser,
  getAllUsers,
} from "../../config/redux/action/authAction";
import UserLayout from "../../layout/UserLayout";
import DashboardLayout from "../../layout/DashboardLayout";
import {
  resetPostId,
  setSelectedPostId,
} from "../../config/redux/reducer/postReducer";

export default function Dashboard() {
  const router = useRouter();

  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const currentUserId = authState.user?.userId?._id;

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere]);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState();
  const [expandedPosts, setExpandedPosts] = useState({});
  const [commentText, setCommentText] = useState("");

  const handleUpload = async () => {
    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
    dispatch(getAllPosts());
  };

  const handleSubmitComment = async () => {
    if (commentText.trim() === "") return;

    dispatch(getAllComments({ post_id: postState.selectedPostId }));
    setCommentText("");
    await dispatch(
      postComment({
        post_id: postState.selectedPostId,
        body: commentText,
      })
    );
    dispatch(getAllComments({ post_id: postState.selectedPostId }));
  };

  if (authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className="flex justify-center flex-col bg-gray-200 gap-1">
            <div className="flex justify-center items-center">
              <div className=" relative bg-white shadow-xl sm:rounded-lg w-full flex h-fit items-center p-5 justify-center gap-6">
                <div className="flex items-center gap-3 w-full">
                  <img
                    className="rounded-full size-[3.6rem] object-cover"
                    src={authState.user.userId.profilePicture}
                    alt=""
                  />
                  <textarea
                    onChange={(e) => setPostContent(e.target.value)}
                    value={postContent}
                    placeholder={"Share your latest update or idea..."}
                    className="w-[80%] h-[80%] border border-gray-400 rounded-[10px] font-sans px-5 py-2 outline-none"
                    name="text"
                    id=""
                  ></textarea>
                  <label htmlFor="fileUpload">
                    <div className="flex justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-8 text-gray-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </label>
                  <input
                    onChange={(e) => setFileContent(e.target.files[0])}
                    type="file"
                    hidden
                    id="fileUpload"
                  />
                </div>
                {postContent.length > 0 && (
                  <div
                    onClick={handleUpload}
                    className="absolute right-0 -bottom-5 cursor-pointer font-semibold transition-all duration-300 ease-in-out shadow-md 
                    bg-sky-500 text-blue-50 rounded-lg px-6 py-1
                    hover:bg-[#00aaff] hover:text-white hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-lg"
                  >
                    Post
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <div className="  h-[0.1rem] flex-9/10 bg-gray-400"></div>
              <p className=" font-100 text-sm flex-1/10">Top feed</p>
            </div>

            <div className="bg-gray-200">
              <div className="flex flex-col sm:rounded-lg gap-3">
                {postState.posts.map((post) => {
                  if (!post.userId) return null;
                  return (
                    <div
                      key={post._id}
                      className="bg-white sm:rounded-lg shadow-xl"
                    >
                      <div className={` flex flex-col`}>
                        <div className="flex relative gap-5 w-full px-5 py-3">
                          <img
                            onClick={() => {
                              router.push(
                                `/view_profile/${post.userId.username}`
                              );
                            }}
                            className="rounded-full size-15 object-cover cursor-pointer"
                            src={post.userId.profilePicture}
                            alt=""
                          />

                          <div className="flex flex-col">
                            <p
                              onClick={() => {
                                router.push(
                                  `/view_profile/${post.userId.username}`
                                );
                              }}
                              className="font-bold text-xl cursor-pointer"
                            >
                              {post.userId.name}
                            </p>

                            <p style={{ color: "gray" }}>
                              @{post.userId.username}
                            </p>
                          </div>
                          {post.userId._id === authState.user.userId._id && (
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
                        <div className="w-full h-fit">
                          {post.media !== "" ? (
                            <img
                              src={post.media}
                              className="w-full h-auto object-cover"
                              alt="postmedia"
                            />
                          ) : (
                            <></>
                          )}
                        </div>

                        <div className="">
                          <div className="flex justify-between py-2 items-center px-15">
                            {/* <div
                              onClick={async () => {
                                dispatch(getAllPosts());
                                await dispatch(
                                  incrementPostLike({ post_id: post._id })
                                );
                                dispatch(getAllPosts());
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
                                  d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                                />
                              </svg>
                              <p className="pl-2">{post.likes}</p>
                            </div> */}

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
                                dispatch(getAllComments({ post_id: post._id }));
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
          {postState.selectedPostId !== "" && (
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
                className="relative bg-white rounded-lg w-[95vw] sm:w-[60vw] lg:w-[70vh] min-h-[40svh] max-w-[1120px] h-[50vh] sm:h-[80vh] p-6 flex flex-col"
              >
                <h2 className="text-lg font-bold mb-4">Comments</h2>
                {(!postState.commentsByPostId[postState.selectedPostId] ||
                  postState.commentsByPostId[postState.selectedPostId]
                    .length === 0) && (
                  <h2 className="text-gray-500 py-8 text-center">
                    No Comments
                  </h2>
                )}

                <div
                  className={`flex-1 overflow-y-auto space-y-4 pr-2 pb-20 hide-scrollbar`}
                >
                  {postState.commentsByPostId[postState.selectedPostId]
                    ?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {postState.commentsByPostId[postState.selectedPostId].map(
                        (comment) => {
                          let user = comment.userId;
                          // If userId is just an ID, find the user in allUsers
                          if (typeof user === "string" && authState.allUsers) {
                            user = authState.allUsers.find(
                              (u) => u._id === user
                            );
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
                                    <p className="mt-1 text-sm">
                                      {comment.body}
                                    </p>
                                  </div>
                                  {comment.userId._id ===
                                    authState.user?.userId?._id && (
                                    <button
                                      onClick={async () => {
                                        await dispatch(
                                          deleteComment({
                                            comment_id: comment._id,
                                            post_id: postState.selectedPostId,
                                          })
                                        );
                                        await dispatch(
                                          getAllComments(
                                            postState.selectedPostId
                                          )
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
                        }
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-2 sm:bottom-5 left-[18px] sm:left-5 w-[90%] flex items-center justify-center gap-2 sm:gap-5">
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
        </DashboardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashboardLayout>
          <p className="loading"></p>
        </DashboardLayout>
      </UserLayout>
    );
  }
}
