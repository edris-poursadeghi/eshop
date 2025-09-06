import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegisterData,
  verifyOtp,
} from '../utils/auth.helper';
import prisma from '@packages/libs/prisma';
import { ValidationError } from '@packages/error-handler';

// Rigister a new user
export const userRegisteration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);

  try {
    validateRegisterData(req.body, 'user');

    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

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

    console.log({ password });

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
