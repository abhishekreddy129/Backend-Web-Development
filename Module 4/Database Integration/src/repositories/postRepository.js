const prisma = require('../database/prisma');

function parseId(id) {
  const parsedId = Number(id);
  return Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
}

function databaseError(error) {
  if (error.code === 'P2002') {
    return Object.assign(new Error('A record with those unique fields already exists'), { statusCode: 409 });
  }
  if (error.code === 'P2003') {
    return Object.assign(new Error('A referenced record does not exist'), { statusCode: 422 });
  }
  if (error.code === 'P2000' || error.code === 'P2011' || error.code === 'P2012' || error.name === 'PrismaClientValidationError') {
    return Object.assign(new Error('Invalid database input'), { statusCode: 422 });
  }
  return Object.assign(new Error('Database operation failed'), { statusCode: 503 });
}

async function findAll() {
  try {
    return await prisma.post.findMany({ orderBy: { id: 'asc' } });
  } catch (error) {
    throw databaseError(error);
  }
}

async function findById(id) {
  const parsedId = parseId(id);
  if (parsedId === null) return null;
  try {
    return await prisma.post.findUnique({ where: { id: parsedId } });
  } catch (error) {
    throw databaseError(error);
  }
}

async function create(fields) {
  try {
    return await prisma.post.create({
      data: { title: fields.title, body: fields.body || '', authorId: fields.authorId },
    });
  } catch (error) {
    throw databaseError(error);
  }
}

async function update(id, patch) {
  const parsedId = parseId(id);
  if (parsedId === null) return null;
  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.body !== undefined) data.body = patch.body;
  try {
    return await prisma.post.update({ where: { id: parsedId }, data });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw databaseError(error);
  }
}

async function remove(id) {
  const parsedId = parseId(id);
  if (parsedId === null) return false;
  try {
    const result = await prisma.post.deleteMany({ where: { id: parsedId } });
    return result.count > 0;
  } catch (error) {
    throw databaseError(error);
  }
}

module.exports = { findAll, findById, create, update, remove };
