import express from "express";
import dotenv from "dotenv";
import connecDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors"
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connecDB();
app.get("/", (req, res) => {
    res.send("API Running");
});

app.use("/api/users", userRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`),
);
