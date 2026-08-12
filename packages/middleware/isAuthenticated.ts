import prisma from '@packages/libs/prisma';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  //console.log(req);

  try {
    const token =
      // req.cookies.access_token || req.headers.authorization?.split(' ')[1];
      req.cookies['access_token'] ||
      req.cookies['seller_access_token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized! Token missing. 1' });
    }

    // verify token

    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: 'user' | 'seller';
    };

    console.log({
      decode,
    });

    if (!decode) {
      return res.status(401).json({
        message: 'Unauthorized! Invalid token. 2',
      });
    }

    // Find the account based on role
    let account;
    if (decode.role === 'user') {
      account = await prisma.users.findUnique({ where: { id: decode.id } });
      req.user = account;
    } else if (decode.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decode.id },
        include: { shop: true },
      });
      req.seller = account;
    }

    req.role = decode.role;
    req.xxxxx = 'xxxxx';

      console.log({ account });

    if (!account) {
      return res.status(401).json({
        message: 'Account not found!',
      });
    }

    console.log(`11111`, req.seller.id || req.user);

    return next();
  } catch (error) {
    console.log({ error });

    return res.status(401).json({
      message: 'Unauthorized! Token expired or invalid 3',
    });
  }
};

export default isAuthenticated;
