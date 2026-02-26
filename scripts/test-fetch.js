const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFetch() {
    try {
        const res = await prisma.payment.findMany();
        console.log("Payments:", JSON.stringify(res, null, 2));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
testFetch();
