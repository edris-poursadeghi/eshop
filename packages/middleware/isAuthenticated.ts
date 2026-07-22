import prisma from '@packages/libs/prisma';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  //console.log(req);

  try {
    const token =
      req.cookies.access_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized! Token missing.' });
    }

    // verify token

    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: 'user' | 'seller';
    };

    console.log({
      decode,
      token,
      ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    });

    if (!decode) {
      return res.status(401).json({
        message: 'Unauthorized! Invalid token.',
      });
    }

    const account = await prisma.users.findUnique({ where: { id: decode.id } });

    console.log({ account });

    req.user = account;

    if (!account) {
      return res.status(401).json({
        message: 'Account not found!',
      });
    }

    return next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      message: 'Unauthorized! Token expired or invalid',
    });
  }
};

export default isAuthenticated;
