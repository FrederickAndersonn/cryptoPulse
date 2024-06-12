import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = "my secret token";

interface DecodedToken {
  user: {
    id: string;
  };
}


declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
    };
  }
}

export default function(req: Request, res: Response, next: NextFunction): void | Response {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
}
