const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Suppression des données...');

    // Need to delete dependencies first if any, or just delete all
    await prisma.invoiceItem.deleteMany({});
    await prisma.quoteItem.deleteMany({});
    await prisma.deliveryNote.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.quote.deleteMany({});

    console.log('Base de données réinitialisée avec succès !');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
