import { NextFunction, Request, Response } from 'express';
export function errorHandler(
 err: any,
 req: Request,
 res: Response,
 _next: NextFunction
) {
 console.error(err);
 res.status(500).json({ message: 'Unexpected error', detail: err?.message });
}