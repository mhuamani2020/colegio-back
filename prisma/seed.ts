import { PrismaClient, RolNombre } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Roles ──────────────────────────────────────────
  const roles: { nombre: RolNombre; descripcion: string }[] = [
    { nombre: 'super_admin', descripcion: 'Acceso total al sistema' },
    { nombre: 'presidente', descripcion: 'Presidente de la promoción' },
    { nombre: 'tesorero', descripcion: 'Tesorero encargado de finanzas' },
    { nombre: 'secretaria', descripcion: 'Secretaria de actas y documentos' },
    { nombre: 'vocal', descripcion: 'Vocal de la directiva' },
    { nombre: 'padre', descripcion: 'Padre de familia' },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: { descripcion: rol.descripcion },
      create: rol,
    });
  }
  console.log(`  ✓ ${roles.length} roles creados`);

  // ─── Conceptos de Pago ─────────────────────────────
  const conceptos = [
    { nombre: 'Casaca', descripcion: 'Casaca promocional', montoSugerido: 120 },
    { nombre: 'Anuario', descripcion: 'Anuario promocional', montoSugerido: 85 },
    { nombre: 'Viaje', descripcion: 'Viaje de promoción', montoSugerido: 250 },
    { nombre: 'Llaveros', descripcion: 'Llaveros promocionales', montoSugerido: 15 },
    { nombre: 'Otros', descripcion: 'Otros conceptos', montoSugerido: null },
  ];

  for (const c of conceptos) {
    await prisma.conceptoPago.upsert({
      where: { nombre: c.nombre },
      update: { descripcion: c.descripcion, montoSugerido: c.montoSugerido },
      create: { nombre: c.nombre, descripcion: c.descripcion, montoSugerido: c.montoSugerido },
    });
  }
  console.log(`  ✓ ${conceptos.length} conceptos de pago creados`);

  // ─── Super Admin ────────────────────────────────────
  const adminRol = await prisma.rol.findUniqueOrThrow({
    where: { nombre: 'super_admin' },
  });

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@promocion.com' },
    update: { nombre: 'Super', apellido: 'Admin', passwordHash },
    create: {
      email: 'admin@promocion.com',
      passwordHash,
      nombre: 'Super',
      apellido: 'Admin',
      rolId: adminRol.id,
    },
  });
  console.log('  ✓ Super Admin creado (admin@promocion.com / Admin123!)');

  // ─── Categorías de Documentos ──────────────────────
  const categoriasDoc = [
    { nombre: 'Actas', descripcion: 'Actas de reuniones de la directiva' },
    { nombre: 'Acuerdos', descripcion: 'Acuerdos y compromisos de la promoción' },
    { nombre: 'Comunicados', descripcion: 'Comunicados oficiales a los padres' },
    { nombre: 'Informes', descripcion: 'Informes financieros y de gestión' },
    { nombre: 'Otros', descripcion: 'Otros documentos de interés' },
  ];

  for (const cat of categoriasDoc) {
    await prisma.categoriaDocumento.upsert({
      where: { nombre: cat.nombre },
      update: { descripcion: cat.descripcion },
      create: cat,
    });
  }
  console.log(`  ✓ ${categoriasDoc.length} categorías de documentos creadas`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
