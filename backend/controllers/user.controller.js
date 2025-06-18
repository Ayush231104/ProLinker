import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import getStream from "get-stream";
// import fs from "fs";
// import path from "path";
import axios from "axios"
import ConnectionRequest from "../models/connections.model.js";

// const convertUserDataTOPDF = async (userData) => {
//   const doc = new PDFDocument();
//   const buffers = [];

//   const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
//   const stream = fs.createWriteStream("linkPost/" + outputPath);

//   doc.on("data", buffers.push.bind(buffers));
//   doc.on("end", () => {});

//   doc.pipe(stream);

//   try {
//     doc.image(userData.userId.profilePicture, {
//       align: "center",
//       width: 100,
//     });
//   } catch (err) {
//     doc.text("[Profile Picture not found]");
//   }
//   doc.fontSize(14).text(`Name: ${userData.userId.name}`);
//   doc.fontSize(14).text(`Username: ${userData.userId.username}`);
//   doc.fontSize(14).text(`Email: ${userData.userId.email}`);
//   doc.fontSize(14).text(`Bio: ${userData.bio}`);
//   doc.fontSize(14).text(`Current Position: ${userData.currentPost}`);

//   doc.fontSize(14).text("Past Work: ");
//   userData.pastWork.forEach((work, index) => {
//     doc.fontSize(14).text(`Company Name: ${work.company}`);
//     doc.fontSize(14).text(`Position: ${work.position}`);
//     doc.fontSize(14).text(`Years : ${work.years}`);
//   });

//   doc.end();

//   // return outputPath;
//   const pdfBuffer = await getStream.buffer(doc);
//   return pdfBuffer;
// };
const convertUserDataTOPDF = async (userData) => {
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];

  // Collect stream in buffer
  doc.on("data", buffers.push.bind(buffers));

  // HEADER SECTION WITH IMAGE
  try {
    if (userData.userId.profilePicture) {
      const imageUrl = userData.userId.profilePicture;
      const response = await axios({ url: imageUrl, responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data, "binary");
      doc.image(imageBuffer, doc.page.width - 150, 30, { width: 80, height: 80 });
    }
  } catch (err) {
    doc.fontSize(10).fillColor("red").text("[Profile Picture Not Available]", { align: "right" });
  }

  // Name and Contact Info
  doc
    .fontSize(22)
    .fillColor("#333")
    .text(userData.userId.name, { continued: true })
    .fillColor("gray")
    .text(`(@${userData.userId.username})`);

  doc.fontSize(12).fillColor("black").text(`Email: ${userData.userId.email}`);
  doc.moveDown();

  // Bio Section
  doc
    .fontSize(14)
    .fillColor("#0056b3")
    .text("Bio", { underline: true });
  doc.fontSize(12).fillColor("black").text(userData.bio || "N/A");
  doc.moveDown();

  // Current Position
  doc
    .fontSize(14)
    .fillColor("#0056b3")
    .text("Current Position", { underline: true });
  doc.fontSize(12).fillColor("black").text(userData.currentPost || "N/A");
  doc.moveDown();

  // Past Work Experience
  doc
    .fontSize(14)
    .fillColor("#0056b3")
    .text("Past Work Experience", { underline: true });

  if (userData.pastWork && userData.pastWork.length > 0) {
    doc.moveDown(0.5);
    userData.pastWork.forEach((work) => {
      doc
        .fontSize(12)
        .fillColor("black")
        .text(`• ${work.position} at ${work.company} (${work.years})`);
    });
  } else {
    doc.fontSize(12).fillColor("gray").text("No past work experience listed.");
  }

  // Finalize PDF
  doc.end();
  const pdfBuffer = await new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
  });
  return pdfBuffer;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!email || !name || !password || !username)
      return res.status(400).json({ message: "All fields are required!" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({message: "Password must be at least 6 characters long, include uppercase, lowercase, number, and special character."});
  }

    const user = await User.findOne({email});
    if (user) return res.status(400).json({ message: "User already exist" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    newUser.token = token;

    await newUser.save();

    const profile = new Profile({ userId: newUser._id });

    await profile.save();

    return res.json({ message: "User Created!!", token, newUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required!" });

    const user = await User.findOne({
      email,
    });

    if (!user)
      return res.status(400).json({ message: "User dose not exist!!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });

    return res.json({ token: token, user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // user.profilePicture = req.file.filename;
    user.profilePicture = req.file.path;

    await user.save();

    return res.json({ message: "Profile picture updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const uploadBackgroundPicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // user.profilePicture = req.file.filename;
    user.backgroundPicture = req.file.path;

    await user.save();

    return res.json({ message: "Profile picture updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const { username, email } = newUserData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        res.status(400).json({ message: "User already exist" });
      }
    }
    // if(existingUser && String(existingUser._id) !== String(user._id)){
    //     res.status(400).json({ message: "User already exist" });
    // }

    Object.assign(user, newUserData);

    await user.save();

    return res.json({ message: "User Updated!" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture backgroundPicture"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "User Profile Not Found" });
    }

    await userProfile.save();

    return res.json({userProfile});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    const userProfile = await User.findOne({ token: token });

    if (!userProfile) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });

    Object.assign(profile_to_update, newProfileData);

    await profile_to_update.save();

    return res.json({ message: "Profile Updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name email username profilePicture backgroundPicture"
    );

    return res.json({ profiles });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name email username profilePicture backgroundPicture"
    );
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const pdfBuffer = await convertUserDataTOPDF(userProfile);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${userProfile.userId.username}_resume.pdf"`,
    });

    return res.send(pdfBuffer);
  } catch (err) {
    console.error("Resume download error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const connectionUser = await User.findOne({ _id: connectionId });

    if (!connectionUser) {
      return res.status(404).json({ message: "Connection User Not Found" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (existingRequest) {
      return res.status(404).json({ message: "Request already sent" });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    await request.save();

    return res.json({ message: "Request Sent" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyConnectionRequests = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name email username profilePicture backgroundPicture");

    return res.json({ connections });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name email username profilePicture backgroundPicture");

    return res.json(connections);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const connection = await ConnectionRequest.findOne({ _id: requestId });

    if (!connection) {
      return res.status(404).json({ message: "Connection Not Found" });
    }

    if (action_type == "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }

    await connection.save();

    return res.json({ message: "Request Updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getUserProfileBasedOnUsername = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id })
      .populate("userId", "name username email profilePicture backgroundPicture");

      if (!userProfile) {
        return res.status(404).json({ message: "Profile Not Found" });
      }
    return res.json({ profile: userProfile });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
