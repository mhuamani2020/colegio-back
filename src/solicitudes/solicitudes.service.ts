import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class SolicitudesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async crear(dto: CreateSolicitudDto) {
    // Check if email already exists as user
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado en el sistema');
    }

    // Check if there's already a pending request for this email
    const existingSolicitud = await this.prisma.solicitudAcceso.findUnique({
      where: { email: dto.email },
    });
    if (existingSolicitud && existingSolicitud.estado === 'pendiente') {
      throw new ConflictException('Ya tienes una solicitud pendiente. Espera la respuesta del administrador.');
    }

    // If there's a rejected request, allow re-submission by updating it
    if (existingSolicitud && existingSolicitud.estado === 'rechazado') {
      return this.prisma.solicitudAcceso.update({
        where: { id: existingSolicitud.id },
        data: {
          nombres: dto.nombres,
          apellidos: dto.apellidos,
          telefono: dto.telefono,
          alumnoNombre: dto.alumnoNombre,
          alumnoGrado: dto.alumnoGrado,
          alumnoSeccion: dto.alumnoSeccion,
          estado: 'pendiente',
          motivoRechazo: null,
        },
      });
    }

    return this.prisma.solicitudAcceso.create({ data: dto });
  }

  async findAll() {
    return this.prisma.solicitudAcceso.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async aprobar(id: number, adminId: number) {
    const solicitud = await this.prisma.solicitudAcceso.findUnique({
      where: { id },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException(`La solicitud ya fue ${solicitud.estado === 'aprobado' ? 'aprobada' : 'rechazada'}`);
    }

    // Check again that email isn't taken
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: solicitud.email },
    });
    if (existingUser) {
      throw new ConflictException('El correo ya tiene un usuario registrado. Rechace la solicitud.');
    }

    // Generate random password
    const rawPassword = randomBytes(6).toString('hex').slice(0, 12); // 12 char alphanumeric
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    // Get padre role
    const rolPadre = await this.prisma.rol.findUnique({
      where: { nombre: 'padre' },
    });
    if (!rolPadre) {
      throw new NotFoundException('Rol "padre" no encontrado en el sistema');
    }

    // Create the user
    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        email: solicitud.email,
        passwordHash,
        nombre: solicitud.nombres,
        apellido: solicitud.apellidos,
        telefono: solicitud.telefono,
        rolId: rolPadre.id,
      },
    });

    // If student info was provided, create the student record
    if (solicitud.alumnoNombre) {
      await this.prisma.alumno.create({
        data: {
          nombre: solicitud.alumnoNombre,
          apellido: solicitud.apellidos, // asume mismo apellido
          grado: solicitud.alumnoGrado,
          seccion: solicitud.alumnoSeccion,
          padreId: nuevoUsuario.id,
        },
      });
    }

    // Mark solicitud as approved
    await this.prisma.solicitudAcceso.update({
      where: { id },
      data: { estado: 'aprobado' },
    });

    // Audit log
    await this.auditoriaService.log({
      usuarioId: adminId,
      accion: 'aprobar_solicitud_acceso',
      entidad: 'solicitud_acceso',
      entidadId: id,
      detalle: { email: solicitud.email, usuarioId: nuevoUsuario.id },
    });

    // Notify the new user
    await this.notificacionesService.log({
      usuarioId: nuevoUsuario.id,
      titulo: 'Acceso concedido 🎉',
      mensaje: `Tu solicitud ha sido aprobada. Tus credenciales: Email: ${solicitud.email} / Contraseña: ${rawPassword}. Te recomendamos cambiar tu contraseña en tu perfil.`,
      tipo: 'sistema',
      entidad: 'usuario',
      entidadId: nuevoUsuario.id,
    });

    return {
      message: 'Solicitud aprobada. Usuario creado exitosamente.',
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        passwordTemp: rawPassword,
      },
    };
  }

  async rechazar(id: number, adminId: number, motivoRechazo: string) {
    const solicitud = await this.prisma.solicitudAcceso.findUnique({
      where: { id },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException(`La solicitud ya fue ${solicitud.estado === 'aprobado' ? 'aprobada' : 'rechazada'}`);
    }

    await this.prisma.solicitudAcceso.update({
      where: { id },
      data: { estado: 'rechazado', motivoRechazo },
    });

    await this.auditoriaService.log({
      usuarioId: adminId,
      accion: 'rechazar_solicitud_acceso',
      entidad: 'solicitud_acceso',
      entidadId: id,
      detalle: { email: solicitud.email, motivo: motivoRechazo },
    });

    return { message: 'Solicitud rechazada' };
  }
}
