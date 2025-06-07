import { useEffect, useState } from "react";
import { BASE_URL, clientServer } from "../../config";
import DashboardLayout from "../../layout/DashboardLayout";
import UserLayout from "../../layout/UserLayout";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  getConnectionsRequest,
  getMyConnectionRequests,
  sendConnectionRequest,
} from "../../config/redux/action/authAction";
import { getAllPosts } from "../../config/redux/action/postAction";

export default function ViewProfilePage({ userProfile }) {

  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCorruntUserInConnection, setIsCorruntUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

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
    console.log(authState.connections, userProfile.userId._id);
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
        <div className="p-5.25 bg-red-50 flex flex-col gap-3">
          <div className="">
            <div className={styles.backDropContainer}>
              <img
                className={styles.backDrop}
                src={userProfile.userId.profilePicture}
                alt="backdrop"
              />
            </div>
          </div>

          <div className="pt-20">
            <div className="flex gap-3">
              <div className="flex-3/5">
                <div
                 
                  className="flex gap-5 ml-2 mb-2 w-fit items-center"
                >
                  <h2 className="font-semibold">{userProfile.userId.name}</h2>
                  <p className="text-gray-600">
                    @{userProfile.userId.username}
                  </p>
                </div>

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
                    onClick={async () => {
                      const response = await clientServer.get(
                        `/user/download_resume?id=${userProfile.userId._id}`
                      );
                      window.open(
                        `${BASE_URL}/${response.data.message}`,
                        "_blank"
                      );
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
                <div className="ml-2 mb-2">
                  <p className="font-medium">{userProfile.bio}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.workHistory}>
            <h2>Work History</h2>

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

          <div className="flex ml-2 mb-2">
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            {userPosts.map((post) => {
              return (
                <div key={post._id} className={styles.postCard}>
                  <div className={styles.card}>
                    <div className={styles.card_profileContainer}>
                      {post.media !== "" ? (
                        <img src={post.media} alt="post" />
                      ) : (
                        <div
                          style={{ width: "3.4rem", height: "3.4rem" }}
                        ></div>
                      )}
                    </div>
                    <p>{post.body}</p>
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
