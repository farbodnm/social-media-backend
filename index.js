const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true}, () => {
  console.log("connected to MongoDB.")
});

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.listen(8880, () => {
  console.log("Backend is running.")
})