import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolNombre } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Usuarios')
@ApiBearerAuth('jwt-auth')
@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // ─── Profile endpoints (any authenticated user) ─────

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil', description: 'Devuelve el perfil del usuario autenticado' })
  getMe(@CurrentUser('id') userId: number) {
    return this.usuariosService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil', description: 'Actualiza nombre, apellido y/o teléfono del usuario autenticado' })
  updateProfile(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usuariosService.updateProfile(userId, dto);
  }

  @Patch('me/change-password')
  @ApiOperation({ summary: 'Cambiar contraseña', description: 'Cambia la contraseña del usuario autenticado' })
  changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usuariosService.changePassword(userId, dto);
  }

  // ─── Admin endpoints (super_admin only) ─────────────

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RolNombre.super_admin)
  @ApiOperation({ summary: 'Listar usuarios (Admin)', description: 'Devuelve todos los usuarios del sistema (solo Super Admin)' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RolNombre.super_admin)
  @ApiOperation({ summary: 'Obtener usuario (Admin)', description: 'Devuelve un usuario por ID (solo Super Admin)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolNombre.super_admin)
  @ApiOperation({ summary: 'Crear usuario (Admin)', description: 'Crea un nuevo usuario (solo Super Admin)' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolNombre.super_admin)
  @ApiOperation({ summary: 'Actualizar usuario (Admin)', description: 'Actualiza datos de un usuario (solo Super Admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, dto);
  }

  @Patch(':id/toggle-activo')
  @UseGuards(RolesGuard)
  @Roles(RolNombre.super_admin)
  @ApiOperation({ summary: 'Activar/Desactivar usuario (Admin)', description: 'Alterna el estado activo/inactivo de un usuario (solo Super Admin)' })
  toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.toggleActivo(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RolNombre.super_admin)
  @ApiOperation({ summary: 'Eliminar usuario (Admin)', description: 'Soft-delete de un usuario (solo Super Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
