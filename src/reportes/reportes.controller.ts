import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
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

  @Get('exportar/por-alumno')
  async exportarPorAlumno(@Res() res: Response) {
    const csv = await this.reportesService.exportarPorAlumnoCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte-por-alumno.csv"',
    );
    // BOM para correcta visualización de tildes en Excel
    res.send('\uFEFF' + csv);
  }

  @Get('exportar/por-concepto')
  async exportarPorConcepto(@Res() res: Response) {
    const csv = await this.reportesService.exportarPorConceptoCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte-por-concepto.csv"',
    );
    res.send('\uFEFF' + csv);
  }
}
