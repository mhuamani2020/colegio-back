import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportesService } from './reportes.service';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen')
  getResumen() {
    return this.reportesService.getResumen();
  }

  @Get('por-alumno')
  getPorAlumno() {
    return this.reportesService.getPorAlumno();
  }

  @Get('por-concepto')
  getPorConcepto() {
    return this.reportesService.getPorConcepto();
  }
}
