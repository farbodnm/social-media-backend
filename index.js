const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
const authRoute = require("./api/routes/auth");

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex : true
}, () => {
  console.log("connected to MongoDB.")
});

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use("/api/auth", authRoute);

app.listen(8880, () => {
  console.log("Backend is running.")
})