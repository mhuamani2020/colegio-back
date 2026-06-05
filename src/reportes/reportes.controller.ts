import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportesService } from './reportes.service';

@ApiTags('Reportes')
@ApiBearerAuth('jwt-auth')
@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen general', description: 'Devuelve total recaudado, avance, y desglose por concepto' })
  getResumen() {
    return this.reportesService.getResumen();
  }

  @Get('por-alumno')
  @ApiOperation({ summary: 'Reporte por alumno', description: 'Devuelve desglose de aportes por alumno con avance porcentual' })
  getPorAlumno() {
    return this.reportesService.getPorAlumno();
  }

  @Get('por-concepto')
  @ApiOperation({ summary: 'Reporte por concepto', description: 'Devuelve desglose de recaudación por concepto de pago' })
  getPorConcepto() {
    return this.reportesService.getPorConcepto();
  }

  @Get('exportar/por-alumno')
  @ApiOperation({ summary: 'Exportar reporte por alumno (CSV)', description: 'Descarga CSV con BOM UTF-8 para Excel' })
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
  @ApiOperation({ summary: 'Exportar reporte por concepto (CSV)', description: 'Descarga CSV con BOM UTF-8 para Excel' })
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
