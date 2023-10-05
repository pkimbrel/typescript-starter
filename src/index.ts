import getStuff from "folder1/getStuff";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "https://localhost:3000"
  })
);

app.use("/api", (req, res) => {
  res.status(200).send(getStuff());
})

app.listen(9080, () => console.log("Listening on port 9080"))