import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
async function main() {
    await prisma.users.deleteMany()

    const password = "adminblogs";
    const hashedPassword = await bcrypt.hash(password, 12);

    const user1 = await prisma.users.create({
        data: {
            username: 'adminblogs',
            password: hashedPassword, 
        },
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })