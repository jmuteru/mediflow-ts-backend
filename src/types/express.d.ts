import type { IUserDocument } from '../models/user.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export {};

