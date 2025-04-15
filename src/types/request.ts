import { IUserDecoded } from "./user";

export interface RequestWithUser extends Request {
  user?: IUserDecoded;
}
