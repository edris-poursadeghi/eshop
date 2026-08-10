import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initializeConfig = async () => {
  try {
    const existingConfig = await prisma.site_configs.findFirst();
    if (!existingConfig) {
      await prisma.site_configs.create({
        data: {
          categories: [
            'Electronics',
            'Fashion',
            'Home & Kitchen',
            'Sport & Fitness',
          ],
          subCategories: {
            Electronics: ['Mobile', 'Laptops', 'Accessories', 'Gaming'],
            Fashion: ['Man', 'Woman', 'Kids', 'Footware'],
            'Home & Kitchen': ['Furniture', 'Appliances', 'Decor'],
            'Sport & Fitness': ['Gym Equipment', 'Outdoor Sports', 'Wearables'],
          },
        },
      });
    }
  } catch (error) {
    console.log('Error initializeConfig site config', error);
  }
};

export default initializeConfig;
