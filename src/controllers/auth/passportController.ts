import authService from "@/services/auth/authService";
import tokenService from "@/services/token/tokenService";
import onRemoveParams from "@/utils/remove-params";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";

interface UserProfile {
  email: string;
  name: string;
  avatar: string;
}

interface RequestWithUserProfile extends Request {
  userProfile?: UserProfile;
}

function createUrlParams(obj: Record<string, string | number>): string {
  const params = new URLSearchParams();

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      params.append(key, String(obj[key]));
    }
  }

  return params.toString();
}

const passportController = {
  authenticateByGoogle: (
    req: RequestWithUserProfile,
    res: Response,
    next: NextFunction
  ): void => {
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })(req, res, next);
  },

  authenticateCallback: async (
    req: RequestWithUserProfile,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    passport.authenticate(
      "google",
      {
        failureRedirect: `${process.env.BASE_URL_CLIENT}/login?status=error&message=login_with_google_failed`,
      },
      async () => {
        // if (req.userProfile) {
        //   const { email, name, avatar } = req.userProfile;
        //   const rs = await authService.loginByGoogle(email, name, avatar);
        //   const accessToken = tokenService.generateToken(rs.data);
        //   const params = createUrlParams(onRemoveParams(rs.data));
        //   return res.redirect(
        //     `${process.env.BASE_URL_CLIENT}/login-google?status=success&${params}&accessToken=${accessToken}`
        //   );
        // } else {
        //   return res.redirect(
        //     `${process.env.BASE_URL_CLIENT}/login?status=error&message=profile_not_found`
        //   );
        // }
      }
    )(req, res, next);
  },
};

export default passportController;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BASE_URL_SERVER}/v1/auth/google/callback`,
      passReqToCallback: true,
    },
    (
      req: RequestWithUserProfile,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (err: any, user?: any) => void
    ) => {
      const email = profile.email;
      const name = profile.displayName;
      const avatar = profile.picture;
      req.userProfile = { email, name, avatar };
      return done(null, profile);
    }
  )
);
