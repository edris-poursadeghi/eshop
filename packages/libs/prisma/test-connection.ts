// test-connection.ts
import prisma from '@packages/libs/prisma';

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await prisma.$connect();
    console.log('✅ Connected successfully!');

    // Test operations
    const userCount = await prisma.users.count();
    console.log(`📊 Total users: ${userCount}`);

    const imageCount = await prisma.images.count();
    console.log(`🖼️ Total images: ${imageCount}`);

  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();