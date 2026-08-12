import { NotFoundError, ValidationError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import { Request, Response, NextFunction } from 'express';

// get product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_configs.findFirst();

    if (!config) {
      return res.status(404).json({ message: 'Categories not found' });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// Create discount codes
export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExists = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExists) {
      new ValidationError(`Discount code ${discountCode} already exists`);
    }

    const discount_Code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({
      success: true,
      discount_Code,
    });
  } catch (error) {
    next(error);
  }
};

// get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  //console.log('getDiscountCodes', req);

  try {
    const discountCodes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });
    res.status(200).json({ success: true, discountCodes });
  } catch (error) {
    next(error);
  }
};

// delete discount codes
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCodes = await prisma.discount_codes.findUnique({
      where: {
        id,
      },
      select: { id: true, sellerId: true },
    });

    console.log('deleteDiscountCode', { discountCodes });

    if (!discountCodes) {
      return next(new NotFoundError('Discount code not found'));
    }

    if (!discountCodes.sellerId !== sellerId) {
      return next(new ValidationError('Unauthorized access! 4'));
    }

    await prisma.discount_codes.delete({
      where: {
        id,
      },
    });
    res.status(200).json({ message: 'Discount code deleted successfully' });
  } catch (error) {
    next(error);
  }
};
