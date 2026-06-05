import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  // ─── Profile (any authenticated user) ─────────────

  async getMe(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        activo: true,
        rol: { select: { id: true, nombre: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.getMe(userId);

    return this.prisma.usuario.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        rol: { select: { id: true, nombre: true } },
        updatedAt: true,
      },
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.auditoriaService.log({
      usuarioId: userId,
      accion: 'cambiar_password',
      entidad: 'usuario',
      entidadId: userId,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  // ─── Admin endpoints ──────────────────────────────

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        activo: true,
        rol: { select: { id: true, nombre: true } },
        createdAt: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        activo: true,
        rol: { select: { id: true, nombre: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }

    return usuario;
  }

  async create(dto: CreateUsuarioDto) {
    const existing = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        passwordHash,
        nombre: dto.nombre,
        apellido: dto.apellido,
        telefono: dto.telefono,
        rolId: dto.rolId,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        activo: true,
        rol: { select: { id: true, nombre: true } },
        createdAt: true,
      },
    });

    await this.auditoriaService.log({
      accion: 'crear_usuario',
      entidad: 'usuario',
      entidadId: user.id,
      detalle: { email: dto.email, rolId: dto.rolId, nombre: dto.nombre, apellido: dto.apellido },
    });

    return user;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    const user = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...dto,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        activo: true,
        rol: { select: { id: true, nombre: true } },
        updatedAt: true,
      },
    });

    await this.auditoriaService.log({
      accion: 'actualizar_usuario',
      entidad: 'usuario',
      entidadId: id,
      detalle: { ...dto },
    });

    return user;
  }

  async toggleActivo(id: number) {
    const usuario = await this.findOne(id);

    const result = await this.prisma.usuario.update({
      where: { id },
      data: { activo: !usuario.activo },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true,
        rol: { select: { id: true, nombre: true } },
      },
    });

    await this.auditoriaService.log({
      accion: result.activo ? 'activar_usuario' : 'desactivar_usuario',
      entidad: 'usuario',
      entidadId: id,
      detalle: { activo: result.activo },
    });

    return result;
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);

    // Soft delete — deactivate instead of delete
    const result = await this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: {
        id: true,
        email: true,
        nombre: true,
        activo: true,
      },
    });

    await this.auditoriaService.log({
      accion: 'eliminar_usuario',
      entidad: 'usuario',
      entidadId: id,
      detalle: { email: usuario.email },
    });

    return result;
  }
}
