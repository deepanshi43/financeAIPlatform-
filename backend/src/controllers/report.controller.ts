import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  generateReportService,
  getAllReportsService,updateReportSettingService,

} from "../services/report.service";
 import { updateReportSettingSchema } from "../validators/report.validator";

export const getAllReportsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 20,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const result = await getAllReportsService(userId, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reports history fetched successfully",
      ...result,
    });
  }
);

export const updateReportSettingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = updateReportSettingSchema.parse(req.body);

    await updateReportSettingService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reports setting updated successfully",
    });
  }
);

// export const generateReportController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const userId = req.user?._id;
//     const { from, to } = req.query;
//     const fromDate = new Date(from as string);
//     const toDate = new Date(to as string);

//     const result = await generateReportService(userId, fromDate, toDate);

//     return res.status(HTTPSTATUS.OK).json({
//       message: "Report generated successfully",
//       ...result,
//     });
//   }
// );



export const generateReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    // Helper function to safely parse query dates
    function parseQueryDate(value: any, fieldName: string): Date {
      if (!value)
        throw {
          code: "custom",
          message: `'${fieldName}' is required`,
          path: [fieldName],
        };

      const strValue = (Array.isArray(value) ? value[0] : value)
        .toString()
        .trim(); // Trim whitespace
      const date = new Date(strValue);

      if (isNaN(date.getTime()))
        throw {
          code: "custom",
          message: `Invalid '${fieldName}' date`,
          path: [fieldName],
        };

      return date;
    }

    // Parse and validate 'from' and 'to' dates
    let fromDate: Date, toDate: Date;
    try {
      fromDate = parseQueryDate(req.query.from, "from");
      toDate = parseQueryDate(req.query.to, "to");
    } catch (err: any) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Validation failed",
        errors: [err],
        errorCode: "VALIDATION_ERROR",
      });
    }

    // Call service to generate report
    const result = await generateReportService(userId, fromDate, toDate);

    return res.status(HTTPSTATUS.OK).json({
      message: "Report generated successfully",
      ...result,
    });
  }
);