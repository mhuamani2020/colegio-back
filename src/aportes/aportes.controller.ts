import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AportesService } from './aportes.service';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { QueryAporteDto } from './dto/query-aporte.dto';

@Controller('aportes')
@UseGuards(JwtAuthGuard)
export class AportesController {
  constructor(private readonly aportesService: AportesService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: number; rol: string },
    @Query() query: QueryAporteDto,
  ) {
    return this.aportesService.findAll(user, query);
  }

  @Post()
  create(
    @CurrentUser('id') usuarioId: number,
    @Body() dto: CreateAporteDto,
  ) {
    return this.aportesService.create(usuarioId, dto);
  }
}
