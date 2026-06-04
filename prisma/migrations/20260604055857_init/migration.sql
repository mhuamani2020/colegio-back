-- CreateEnum
CREATE TYPE "RolNombre" AS ENUM ('super_admin', 'presidente', 'tesorero', 'secretaria', 'vocal', 'padre');

-- CreateEnum
CREATE TYPE "EstadoAporte" AS ENUM ('pendiente', 'aprobado', 'rechazado');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" "RolNombre" NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "rol_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumnos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "grado" TEXT,
    "seccion" TEXT,
    "padre_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alumnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conceptos_pago" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "monto_sugerido" DECIMAL(10,2),
    "fecha_limite" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conceptos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aportes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "alumno_id" INTEGER,
    "concepto_id" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoAporte" NOT NULL DEFAULT 'pendiente',
    "motivo_rechazo" TEXT,
    "fecha_aporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validado_por" INTEGER,
    "validado_en" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comprobantes" (
    "id" SERIAL NOT NULL,
    "aporte_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "tipo_mime" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comprobantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_documento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categorias_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "tipo_mime" TEXT NOT NULL DEFAULT 'application/pdf',
    "fecha_documento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subido_por" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_log" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "accion" TEXT NOT NULL,
    "entidad" TEXT,
    "entidad_id" INTEGER,
    "detalle" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "conceptos_pago_nombre_key" ON "conceptos_pago"("nombre");

-- CreateIndex
CREATE INDEX "aportes_estado_idx" ON "aportes"("estado");

-- CreateIndex
CREATE INDEX "aportes_usuario_id_idx" ON "aportes"("usuario_id");

-- CreateIndex
CREATE INDEX "aportes_concepto_id_idx" ON "aportes"("concepto_id");

-- CreateIndex
CREATE INDEX "aportes_alumno_id_idx" ON "aportes"("alumno_id");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_documento_nombre_key" ON "categorias_documento"("nombre");

-- CreateIndex
CREATE INDEX "documentos_categoria_id_idx" ON "documentos"("categoria_id");

-- CreateIndex
CREATE INDEX "auditoria_log_usuario_id_idx" ON "auditoria_log"("usuario_id");

-- CreateIndex
CREATE INDEX "auditoria_log_accion_idx" ON "auditoria_log"("accion");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumnos" ADD CONSTRAINT "alumnos_padre_id_fkey" FOREIGN KEY ("padre_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_concepto_id_fkey" FOREIGN KEY ("concepto_id") REFERENCES "conceptos_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobantes" ADD CONSTRAINT "comprobantes_aporte_id_fkey" FOREIGN KEY ("aporte_id") REFERENCES "aportes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_subido_por_fkey" FOREIGN KEY ("subido_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_log" ADD CONSTRAINT "auditoria_log_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
