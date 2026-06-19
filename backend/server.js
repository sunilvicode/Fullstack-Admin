import express from "express";
import dotenv from "dotenv";
import connecDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


connecDB();
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy", data: {} });
});

app.get("/", (req, res) => {
    res.send("API Running");
});

app.use("/api/users", userRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`),
);
