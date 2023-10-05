import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import getStuff from "folder1/getStuff";

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "https://localhost:3000"
  })
);

app.use("/api", (req, res) => {
  res.status(200).send(getStuff());
});

const port = process.env.PORT;
app.listen(port, () => console.log(`Listening on port ${port}`));
