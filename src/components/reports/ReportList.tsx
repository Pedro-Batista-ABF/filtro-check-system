
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ArrowRight, SendHorizontal, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { useMockReports } from '@/hooks/useMockReports';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 5;

const ReportList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { reports, reportsByDate } = useMockReports();
  
  const handleViewReport = (reportId: string) => {
    navigate(`/relatorio/${reportId}`);
  };
  
  const handleResendReport = (reportId: string) => {
    toast.success('Relatório reenviado com sucesso!');
  };

  // Paginar relatórios
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = reports.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(reports.length / ITEMS_PER_PAGE);

  // Verificar se um relatório tem os dados necessários
  const isValidReport = (report: any) => {
    return report && 
           report.id && 
           report.title && 
           report.date && 
           typeof report.sectorCount === 'number' && 
           report.sectorCount > 0;
  };

  return (
    <div className="space-y-8">
      {/* Relatórios organizados por data */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Relatórios por Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(reportsByDate).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(reportsByDate).map(([year, months]) => (
                <div key={year} className="space-y-2">
                  <h3 className="text-lg font-semibold">{year}</h3>
                  <div className="pl-4 space-y-2">
                    {Object.entries(months).map(([month, monthReports]) => {
                      // Filtrar relatórios inválidos
                      const validReports = monthReports.filter(isValidReport);
                      
                      if (validReports.length === 0) {
                        return null; // Pular meses vazios
                      }
                      
                      return (
                        <div key={`${year}-${month}`} className="space-y-1">
                          <h4 className="text-md font-medium">{month}</h4>
                          <div className="pl-4 grid gap-1">
                            {validReports.map(report => (
                              <div 
                                key={report.id} 
                                className="flex justify-between items-center hover:bg-gray-50 p-1 rounded"
                              >
                                <div className="flex items-center">
                                  <span className="text-sm">{format(new Date(report.date), 'dd/MM/yyyy')}</span>
                                  <span className="mx-2 text-gray-400">•</span>
                                  <span className="text-sm font-medium">{report.title}</span>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleViewReport(report.id)}
                                    className="flex items-center"
                                  >
                                    <ArrowRight className="h-3.5 w-3.5 mr-1" />
                                    <span className="text-xs">Ver</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleResendReport(report.id)}
                                    className="flex items-center"
                                  >
                                    <SendHorizontal className="h-3.5 w-3.5 mr-1" />
                                    <span className="text-xs">Reenviar</span>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum relatório encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de relatórios */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Todos os Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Setores</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReports.length > 0 ? (
                paginatedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{format(new Date(report.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{report.sectorCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewReport(report.id)}
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleResendReport(report.id)}
                        >
                          <SendHorizontal className="h-4 w-4 mr-1" />
                          Reenviar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    <div className="py-4 flex flex-col items-center">
                      <AlertCircle className="h-6 w-6 text-gray-400 mb-2" />
                      <span className="text-gray-500">Nenhum relatório encontrado</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportList;
