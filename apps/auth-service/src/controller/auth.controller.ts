import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegisterData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from '../utils/auth.helper';
import prisma from '@packages/libs/prisma';
import { AuthError, ValidationError } from '@packages/error-handler';

import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { setCookie } from '../utils/cookies/setCookie';
// import Stripe from 'stripe';
import crypto from 'crypto';

/* const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
}); */

// Rigister a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);

  try {
    validateRegisterData(req.body, 'user');

    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

    console.log({ existingUser });

    if (existingUser) {
      return next(new ValidationError('User already exists with this email!'));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'user-activation-mail');

    res.status(200).json({
      message: 'OTP send to email. Please verify your account.',
    });
  } catch (error) {
    return next(error);
  }
};

// verify user with otp
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(new ValidationError('All fields are required!'));
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new ValidationError('User already exists with this email!'));
    }

    // enforce string type
    if (typeof password !== 'string') {
      return next(new ValidationError('Password must be a string!'));
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const user = await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    console.log(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

// login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError('Email and password are required!'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new AuthError("User doesn't exists!"));

    // verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError('Invalid email or password'));
    }

    res.clearCookie('seller_access_token');
    res.clearCookie('seller_refresh_token');

    // Generate access and refresh token

    const accessToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.JWT_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    // store the refresh and access token in token in an httpOnly secure cookie
    setCookie(res, 'refresh_token', refreshToken);
    setCookie(res, 'access_token', accessToken);

    res.status(200).json({
      message: 'Login successfull !',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};

// refresh token user/seller
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // const refreshToken = req.cookies.refresh_token;

    const refreshToken =
      req.cookies['refresh_token'] ||
      req.cookies['seller_refresh_token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      return new JsonWebTokenError('Unauthorized! No refresh token. ');
    }

    const decode = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decode || !decode.id || !decode.role) {
      return next(new JsonWebTokenError('Forbidden! Invalid refresh token.'));
    }

    console.log({ decode });

    // const user = await prisma.users.findUnique({ where: { id: decode.id } });
    let account;
    if (decode.role === 'user') {
      account = await prisma.users.findUnique({ where: { id: decode.id } });
    } else if (decode.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decode.id },
        include: { shop: true },
      });
    }

    console.log({ account });

    if (!account) {
      return next(new AuthError('Forbidden! User/Seller not found')); // ✅ Fixed
    }

    const newAccessToken = jwt.sign(
      { id: decode.id, role: decode.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    console.log({ newAccessToken });

    if (decode.role === 'user') {
      setCookie(res, 'access_token', newAccessToken);
    } else if (decode.role === 'seller') {
      setCookie(res, 'seller_access_token', newAccessToken);
    }

    req.role = decode.role;

    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    return next(error);
  }
};

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, 'user');
};

// user forgot password
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

// reset user password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError('Email and new password are required!'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new ValidationError('User not found!'));

    // compare new password with the existing one

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword)
      return next(
        new ValidationError(
          'New password cannot be the same as the old password!'
        )
      );

    // hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message: 'Password reset successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// register a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegisterData(req.body, 'seller');
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    console.log(existingSeller);

    if (existingSeller) {
      throw new ValidationError('Seller already exists with this email');
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'seller-activation-mail');

    res
      .status(200)
      .json({ message: 'OTP sent to email. Please verify your account.' });
  } catch (error) {
    next(error);
  }
};

// verify seller with OTP
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError('All fields are required!'));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(
        new ValidationError('Seller already exists with this email!')
      );
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number,
      },
    });

    res.status(201).json({ seller, message: 'Seller registerd successfully!' });
  } catch (error) {}
};

// create a new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (
      !address ||
      !bio ||
      !category ||
      !name ||
      !opening_hours ||
      !website ||
      !sellerId
    ) {
      return next(new ValidationError('All fields are required!'));
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== '') {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    return res.status(201).json({
      success: true,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

/// create stripe connect account link
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError('Seller ID is required'));
    }

    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      return next(
        new ValidationError('Seller is not available with this id !')
      );
    }
    /*
    const account = await stripe.accounts.create({
      type: 'express',
      email: seller.email,
      country: 'GB',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    }); */

    // Generate base64 string = account.id
    const id = crypto.randomBytes(8).toString('base64');
    const account = { id };

    await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        stripeId: account.id,
      },
    });

    /*     const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: 'account_onboarding',
    });
 */

    const accountLink = { url: `http://localhost:3000/success` };

    return res.status(201).json({
      url: accountLink.url,
    });
  } catch (error) {
    next(error);
  }
};

// login seller

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError('Email and password are required!'));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) return next(new AuthError('Invalid email or password!'));

    // verify password
    const isMatch = await bcrypt.compare(password, seller.password!);
    if (!isMatch) {
      return next(new AuthError('Invalid email or password!"'));
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    // Generate access and refresh token
    const accessToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.JWT_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    // store the refresh and access token in token in an httpOnly secure cookie
    setCookie(res, 'seller_refresh_token', refreshToken);
    setCookie(res, 'seller_access_token', accessToken);

    res.status(200).json({
      message: 'Login successfull !',
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    return next(error);
  }
};

export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};
