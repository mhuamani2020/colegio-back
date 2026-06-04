import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AportesService } from './aportes.service';
import { CreateAporteDto } from './dto/create-aporte.dto';

@Controller('aportes')
@UseGuards(JwtAuthGuard)
export class AportesController {
  constructor(private readonly aportesService: AportesService) {}

  @Post()
  create(
    @CurrentUser('id') usuarioId: number,
    @Body() dto: CreateAporteDto,
  ) {
    return this.aportesService.create(usuarioId, dto);
  }
}
