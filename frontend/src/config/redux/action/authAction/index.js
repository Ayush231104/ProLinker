import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../..";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue({ message: "Token Not Provided" });
      }

      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
    "user/register",
    async (user, thunkAPI) => {
      try {
        const response = await clientServer.post("/register", {
          username: user.username,
          name: user.name,
          email: user.email,
          password: user.password,
        });

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          return thunkAPI.fulfillWithValue(response.data.token);
        } else {
          return thunkAPI.rejectWithValue({ message: "Token Not Provided" });
        }

      } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || "Registration Failed");
      }
    }
  );

export const getAboutUser = createAsyncThunk(
  "user/getUserAndProfile",
  async (user, thunkAPI) => {
    try{

      const response = await clientServer.get("/get_user_and_profile",{
        params: {
          token: user.token
        }
      })

      return thunkAPI.fulfillWithValue(response.data)
    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data)
    }
  }
)

export const getAllUsers = createAsyncThunk(
  "user/getAllUserProfile",
  async (_, thunkAPI) =>{
    try{
      const response = await clientServer.get("/user/get_all_user");

      return thunkAPI.fulfillWithValue(response.data);      

    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
)

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (user, thunkAPI) =>{
    try{
      const response = await clientServer.post('/user/send_connection_request', {
        token: user.token,
        connectionId: user.user_id
      })

      await thunkAPI.dispatch(getConnectionsRequest({token: user.token}))

      return thunkAPI.fulfillWithValue(response.data)

    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
)

export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionsRequest",
  async (user, thunkAPI) =>{
    try{
      const response = await clientServer.get("/user/get_connection_requests",{
          params: { token: user.token }
        
      })

      return thunkAPI.fulfillWithValue(response.data.connections)

    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data.message);
    }

  }
)


export const getMyConnectionRequests = createAsyncThunk(
  "user/getMyConnectionRequests",
  async (user, thunkAPI) =>{
    try{
      const response = await clientServer.get("/user/user_connection_request",{
        params: {
          token: user.token
        }
      })
      return thunkAPI.fulfillWithValue(response.data)
    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
)

export const acceptConnection = createAsyncThunk(
  "user/acceptConnection",
  async (user, thunkAPI) =>{
    try{
      const response = await clientServer.post("/user/accept_connection_request",{
          token: user.token,
          requestId: user.connectionId,
          action_type: user.action
        
      })
      return thunkAPI.fulfillWithValue(response.data)
    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
)