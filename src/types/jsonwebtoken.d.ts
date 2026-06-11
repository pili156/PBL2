declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: unknown;
    userId?: number;
    email?: string;
    role?: string;
    nama?: string;
    iat?: number;
    exp?: number;
  }

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string,
    options?: { algorithm?: string; expiresIn?: string | number }
  ): string;

  export function verify(
    token: string,
    secretOrPrivateKey: string
  ): JwtPayload | string;
}
