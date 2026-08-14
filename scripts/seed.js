import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const db = createClient({ url: 'file:./dev.db' });

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const driverPassword = await bcrypt.hash('driver123', 10);
  const uuidAdmin = '123e4567-e89b-12d3-a456-426614174000';
  const uuidDriver = '123e4567-e89b-12d3-a456-426614174001';
  const now = new Date().toISOString();

  await db.execute({
    sql: 'INSERT OR IGNORE INTO User (id, username, password, role, createdAt) VALUES (?, ?, ?, ?, ?)',
    args: [uuidAdmin, 'admin', adminPassword, 'ADMIN', now]
  });
  
  await db.execute({
    sql: 'INSERT OR IGNORE INTO User (id, username, password, role, createdAt) VALUES (?, ?, ?, ?, ?)',
    args: [uuidDriver, 'driver', driverPassword, 'DRIVER', now]
  });

  console.log('Seed completed with libsql');
}

main();
