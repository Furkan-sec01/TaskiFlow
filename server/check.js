const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();

async function fixCompletedTasks() {
  const columns = await p.column.findMany({
    where: {
      title: {
        contains: "Tamamland"
      }
    }
  });
  
  for (const col of columns) {
    await p.task.updateMany({
      where: { columnId: col.id },
      data: { isCompleted: true }
    });
    console.log(`${col.title} kolonundaki görevler güncellendi`);
  }
  
  p.$disconnect();
}

fixCompletedTasks();