import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { QueryDocumentoDto } from './dto/query-documento.dto';

@ApiTags('Documentos')
@ApiBearerAuth('jwt-auth')
@Controller('documentos')
@UseGuards(JwtAuthGuard)
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar documentos', description: 'Devuelve documentos con filtro por categoría y búsqueda por título' })
  findAll(@Query() query: QueryDocumentoDto) {
    return this.documentosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener documento', description: 'Devuelve un documento por su ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Subir documento', description: 'Crea un nuevo documento (requiere permisos de subida)' })
  create(
    @CurrentUser() user: { id: number; rol: string },
    @Body() dto: CreateDocumentoDto,
  ) {
    return this.documentosService.create(user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar documento', description: 'Elimina un documento (solo el propietario o roles con permiso)' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; rol: string },
  ) {
    return this.documentosService.remove(id, user.id, user.rol);
  }
}
