import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || 'admin@careerpath.id').trim().toLowerCase();
  const password = args[1] || process.env.ADMIN_PASSWORD || 'Admin123!';

  console.log('--------------------------------------------------');
  console.log('🔐 CareerPath TI: Script Pembuatan Akun Administrator');
  console.log('--------------------------------------------------');

  if (password.length < 6) {
    console.error('❌ Error: Password minimal harus 6 karakter.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  let user;
  if (existingUser) {
    user = await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        role: 'ADMIN'
      }
    });
    console.log(`✅ Berhasil memperbarui akun yang sudah ada menjadi Administrator.`);
  } else {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'ADMIN'
      }
    });
    console.log(`✅ Berhasil mendaftarkan akun Administrator baru ke basis data.`);
  }

  console.log('\n================ KREDENSIAL LOGIN ADMIN ================');
  console.log(`  Email       : ${user.email}`);
  console.log(`  Password    : ${password}`);
  console.log(`  Peran (Role): ${user.role}`);
  console.log(`  User ID     : ${user.id}`);
  console.log('========================================================\n');
  console.log('Petunjuk penggunaan:');
  console.log('1. Buka http://localhost:3000/login');
  console.log('2. Masukkan email dan password di atas');
  console.log('3. Sistem akan mengarahkan otomatis ke dashboard /admin\n');
  console.log('Kustomisasi email & password:');
  console.log('  npm run create:admin custom_admin@careerpath.id Rahasia123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat membuat akun admin:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
