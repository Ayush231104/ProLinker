import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";
import { getAllUsers } from "@/config/redux/action/authAction";

export default function NavBarComponent() {
  const router = useRouter();
  const isRootPath = router.pathname === "/" || router.pathname === "/login";
  const isLogin = router.pathname === "/login";
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [dispatch, authState.all_profiles_fetched]);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() !== "" && Array.isArray(authState.all_users)) {
        const filtered = authState.all_users.filter((user) => {
          const name = user?.userId?.name?.toLowerCase() || "";
          const username = user?.userId?.username?.toLowerCase() || "";
          return (
            name.includes(query.toLowerCase()) ||
            username.includes(query.toLowerCase())
          );
        });
        setResults(filtered);
        setShowSuggestions(true);
      } else {
        setResults([]);
        setShowSuggestions(false);
      }
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [query, authState.all_users]);

  // Hide suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="px-4 sm:px-5 py-3 shadow-lg w-full">
      <nav className="flex sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-0 lg:mx-40 pr-5">
        <div className="flex w-full">
          <div className="flex sm:flex-row items-start sm:items-center gap-3 sm:gap-5 w-full sm:w-auto">
            <h1
              onClick={() => {
                router.push("/dashboard");
              }}
              className="hidden sm:flex text-xl sm:text-2xl font-bold cursor-pointer"
            >
              Pro Linker
            </h1>
            <div className="sm:hidden">
              {authState.profileFetched && (
                <div
                  onClick={() => {
                    router.push("/profile");
                  }}
                  className="cursor-pointer w-14 flex flex-col items-center"
                >
                  <img
                    className="rounded-full size-10 border-2 border-amber-50 hover:brightness-110 hover:scale-105 transition duration-200"
                    src={authState?.user?.userId?.profilePicture}
                    alt=""
                  />
                </div>
              )}
            </div>
            {!isRootPath && (
              <div className="relative w-full sm:w-64" ref={inputRef}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-6 text-gray-400 cursor-pointer"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or username"
                  className="w-[16rem] sm:w-full p-2 pl-12 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {showSuggestions && results.length > 0 && (
                  <div className="absolute z-20 bg-white shadow-md w-full mt-1 rounded-md max-h-64 overflow-y-auto">
                    {results.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => {
                          router.push(`/view_profile/${user.userId.username}`);
                          setQuery("");
                          setResults([]);
                          setShowSuggestions(false);
                        }}
                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer gap-2"
                      >
                        <img
                          src={
                            user?.userId?.profilePicture ||
                            "/default-avatar.png"
                          }
                          alt="profile"
                          className="size-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {user?.userId?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{user?.userId?.username}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`hidden sm:flex`}>
          {authState.profileFetched && (
            <div className="flex gap-3 items-center">
              <div
                onClick={() => {
                  router.push("/dashboard");
                }}
                className="flex flex-col justify-center items-center text-gray-500 hover:text-black transition-colors duration-200 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                  <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                </svg>
                <p className="text-sm">Home</p>
              </div>
              <div
                onClick={() => {
                  router.push("/discover");
                }}
                className="flex flex-col justify-center items-center text-gray-500 hover:text-black transition-colors duration-200 cursor-pointer"
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
                className="flex flex-col justify-center items-center text-gray-500 hover:text-black transition-colors duration-200 cursor-pointer"
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

              <div
                onClick={() => {
                  localStorage.removeItem("token");
                  dispatch(reset());
                  router.push("/login");
                }}
                className="flex flex-col justify-center items-center text-gray-500 hover:text-black transition-colors duration-200 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm">Logout</p>
              </div>
              <div
                onClick={() => {
                  router.push("/profile");
                }}
                className=" cursor-pointer w-8 flex flex-col items-center group"
              >
                <img
                  className="rounded-full w-6 h-6 object-cover flex-shrink-0 group-hover:brightness-110 group-hover:scale-105 transition duration-200"
                  src={authState?.user?.userId?.profilePicture}
                  alt=""
                />
                <p className="text-gray-500 text-sm group-hover:text-black transition duration-200">
                  Me
                </p>
              </div>
            </div>
          )}
          
        </div>
        <div>
          {!isLogin && (
              <div>
                {!authState.profileFetched && (
              <div
                onClick={() => {
                  router.push("/login");
                }}
              >
                <button className="bg-[#cd8997] border-none rounded-[10px] px-5 py-2.5 text-white text-sm font-bold cursor-pointer transition-all duration-300 shadow-md uppercase tracking-[0.5px] hover:bg-[#b06776] hover:shadow-lg hover:-translate-y-0.5">
                  Login
                </button>
              </div>
            )}
              </div>
          )}
          
        </div>
      </nav>
    </div>
  );
}
