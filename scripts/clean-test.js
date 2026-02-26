const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanRaw() {
    try {
        const res = await prisma.payment.deleteMany({
            where: {
                amount: 10,
                method: "CASH"
            }
        });
        console.log("Cleaned:", res);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
cleanRaw();
