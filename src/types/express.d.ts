import { IUserDecoded } from './user';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDecoded;
    }
  }
}