import { createSlice } from "@reduxjs/toolkit";
import { getAllComments, getAllPosts, postComment } from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  postFetched: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  // comments: [],
  // postId: "",
  selectedPostId: "",
  commentsByPostId: {},
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    // resetPostId: (state) => {
    //     state.postId = ""
    // },
    resetPostId: (state) => {
      state.selectedPostId = "";
    },
    setSelectedPostId: (state, action) => {
      state.selectedPostId = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching all the posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postFetched = true;
        state.posts = action.payload.posts.reverse();
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // .addCase(getAllComments.fulfilled, (state, action) => {
      //     state.postId = action.payload.post_id;
      //     state.comments = action.payload.comments;
      // })
      .addCase(getAllComments.fulfilled, (state, action) => {
        const { post_id, comments } = action.payload;
        state.selectedPostId = post_id;
        state.commentsByPostId[post_id] = comments;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        const { post_id, comment } = action.payload;
        if (state.commentsByPostId[post_id]) {
          state.commentsByPostId[post_id].push(comment);
        } else {
          state.commentsByPostId[post_id] = [comment];
        }
      });
  },
});

export const { reset, resetPostId, setSelectedPostId } = postSlice.actions;

export default postSlice.reducer;
