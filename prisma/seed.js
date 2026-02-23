const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

require("dotenv").config();
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("password123", 10);

    const user = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@example.com",
            name: "Makhazine Admin",
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
            subscriptionType: "GOLD",
            subscriptionExpiresAt: new Date("2030-12-31"),
            company: {
                create: {
                    name: "Makhazine Solutions SARL",
                    email: "contact@makhazine.ma",
                    address: "Casablanca Finance City, Tour Casa, Maroc",
                    ice: "001234567890012",
                    rc: "123456",
                    if: "98765432",
                    cn: "45678",
                    phone: "0522XXXXXX",
                    bankAccount: "007123456789012345678901", // 24 digits RIB
                }
            }
        },
    });

    console.log("✅ Admin user created/verified:", user.email);
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
