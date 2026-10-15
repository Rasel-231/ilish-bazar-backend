import jwt, { type JwtPayload, type Secret, type SignOptions } from 'jsonwebtoken';

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string | number,
): string => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as SignOptions['expiresIn'] });
};

const verifyToken = <TPayload extends JwtPayload = JwtPayload>(
  token: string,
  secret: Secret,
): TPayload => {
  return jwt.verify(token, secret) as TPayload;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
