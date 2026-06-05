-- CreateEnum
CREATE TYPE "SolicitudEstado" AS ENUM ('pendiente', 'aprobado', 'rechazado');

-- CreateTable
CREATE TABLE "solicitudes_acceso" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "alumnoNombre" TEXT,
    "alumnoGrado" TEXT,
    "alumnoSeccion" TEXT,
    "estado" "SolicitudEstado" NOT NULL DEFAULT 'pendiente',
    "motivo_rechazo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_acceso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_acceso_email_key" ON "solicitudes_acceso"("email");
