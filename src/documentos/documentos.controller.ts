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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { QueryDocumentoDto } from './dto/query-documento.dto';

@Controller('documentos')
@UseGuards(JwtAuthGuard)
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get()
  findAll(@Query() query: QueryDocumentoDto) {
    return this.documentosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.findOne(id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: number; rol: string },
    @Body() dto: CreateDocumentoDto,
  ) {
    return this.documentosService.create(user.id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; rol: string },
  ) {
    return this.documentosService.remove(id, user.id, user.rol);
  }
}
