import { NextFunction, Request, Response } from "express";

export const errorHandleMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
};

export const validateDogID = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.id || !Number(req.params.id)) {
    return res
      .status(400)
      .json({ message: "id should be a number" });
  }
  next();
};
