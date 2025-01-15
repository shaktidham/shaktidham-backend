const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  if (!token) throw new Error("Authorization token is required.");
  return jwt.verify(token, process.env.JWT_SECRET);
};

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate email and password
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Compare password with hashed password in the database
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       {
//         email: user.email,
//         userId: user._id,
//         role: user.role, // Include role for added context
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "10h" }
//     );

//     // Send the token in the response
//     return res.status(200).json({ data: token });
//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({ message: "Error logging in. Please try again later." });
//   }
// };


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password with hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Capture the user's IP address from the request
    let userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // If multiple IPs are in the x-forwarded-for header, take the first one
    if (userIp && userIp.includes(',')) {
      userIp = userIp.split(',')[0].trim();
    }

    // Check if email is 'vinays' and skip IP check if it is
    if (email !== 'vinay') {
      // Check if the user's stored IP address matches the current IP
      if (user.lastLoginIp && user.lastLoginIp !== userIp) {
        return res.status(403).json({
          message: "Login denied. The device IP address does not match the stored IP address.",
        });
      }
    }

    // If IP is null or matches, save the new IP
    user.lastLoginIp = userIp;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
        role: user.role, // Include role for added context
      },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    // Send the token in the response
    return res.status(200).json({ data: token });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Error logging in. Please try again later." });
  }
};


exports.signup = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!token) {
      return res.status(403).json({ message: "Authorization token is required." });
    }

    const decoded = verifyToken(token);

    // Only allow users with a specific email to sign up
    if (decoded.role!== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }

    const { email, password, role } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if the user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || "user", 
    });

    // Save the user to the database
    await newUser.save();

    return res.status(201).json({ message: "User successfully signed up" });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ err: "Invalid token. Please provide a valid token." });
    }

    console.error("Signup error:", err);
    return res.status(500).json({ message: "Error signing up. Please try again later." });
  }
};
exports.removeip = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    if (!token) {
      return res.status(403).json({ message: "Authorization token is required." });
    }

    const decoded = verifyToken(token);

    // Only allow users with a specific email to sign up
    if (decoded.role!== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }
    const { id } = req.params;

    // Find user by ID
    const user = await User.findById( id );
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Remove the lastLoginIp field from the user
    user.lastLoginIp = undefined;

    // Save the updated user record
    await user.save();

    return res.status(200).json({ message: "Last login IP removed successfully" });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Error processing the request. Please try again later." });
  }
};
