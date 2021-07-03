const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
const authRoute = require("./api/routes/auth");
const userRoute = require("./api/routes/users");
const postRoute = require("./api/routes/posts");

dotenv.config();

mongoose.connect(
	process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	},
	() => {
		console.log("connected to MongoDB.");
	}
);

// CORS handling
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested_With, Content-Type, Accept, Authorization"
	);
	if (req.method === "OPTIONS") {
		res.setHeader(
			"Access-Control-Allow-Methods",
			"GET, POST, PATCH, DELETE, PUT"
		);
		return res.status(200).json({});
	}
	next();
});

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/uploads/", express.static("uploads"));

app.listen(8880, () => {
	console.log("Backend is running.");
});