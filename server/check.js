const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();
p.task.updateMany({
  data: { status: "ACCEPTED" }
}).then(r => {
  console.log('Güncellendi:', r);
  p.$disconnect();
});