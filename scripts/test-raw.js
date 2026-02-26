const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const res = await prisma.$runCommandRaw({
            insert: "Payment",
            documents: [{
                amount: 10,
                date: { "$date": new Date().toISOString() },
                method: "CASH",
                invoiceId: { "$oid": "65db7c8e8e8e8e8e8e8e8e8e" } // dummy
            }]
        });
        console.log("Success:", res);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
