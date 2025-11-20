// src/index.ts

// 1. Load environment variables
import * as dotenv from "dotenv";
dotenv.config();

console.log("MONGO_URI from process.env:", process.env.MONGO_URI);

// 2. Core/third-party imports
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import passport, { initialize } from "passport";

// 3. Configs
import "./config/passport.config";
import { Env } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";

// 4. Middlewares
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";

// 5. Utils
import { BadRequestException } from "./utils/app-error";
// import {calulateNextReportDate  } from "./utils/helper";

// 6. Routes
import authRoutes from "./routes/auth.route";
import { passportAuthenticateJwt } from "./config/passport.config";
import userRoutes from "./routes/user.route";
import transactionRoutes from "./routes/transaction.route";
// import { startJob } from "./crons/scheduler";
import { initializeCrons } from "./crons";
import reportRoutes from "./routes/report.route";
import analyticsRoutes from "./routes/analytics.route";
import { getDateRange } from "./utils/date";
// ================== Express app ==================
const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize()); // ✅ now passport is already imported

app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Test route
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("This is a test error");
  })
);



// calulateNextReportDate();

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);

app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);


app.get("/ping", (req: Request, res: Response) => {
  res.send("Server is running ✅");
});

// Error handler (always last)
app.use(errorHandler);












// ================== MongoDB ==================
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


  

// ================== Server ==================



app.listen(Env.PORT, async () => {
  if (Env.NODE_ENV === "development") {
    await initializeCrons();  // waits before logging
  }
  console.log(`🚀 Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
