import type { IAuthenticatedUser } from './common';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IAuthenticatedUser;
    }
  }
}

export {};
