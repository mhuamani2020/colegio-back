-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('transferencia', 'yape', 'plin');

-- AlterTable
ALTER TABLE "aportes" ADD COLUMN     "metodo_pago" "MetodoPago" NOT NULL DEFAULT 'transferencia';
