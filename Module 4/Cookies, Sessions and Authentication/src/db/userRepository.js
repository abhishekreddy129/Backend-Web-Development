const prisma = require('./prisma');

function findByEmail(email) {
    return prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, passwordHash: true },
    });
}

function findIdentityById(id) {
    return prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true },
    });
}

module.exports = { findByEmail, findIdentityById };