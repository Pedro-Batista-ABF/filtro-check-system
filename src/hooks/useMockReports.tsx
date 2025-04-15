
import { useMemo } from 'react';
import { format } from 'date-fns';

// Tipo para definir a estrutura de um relatório
export interface Report {
  id: string;
  title: string;
  date: string;
  sectorCount: number;
}

// Tipo para relatórios organizados por data
type ReportsByDate = {
  [year: string]: {
    [month: string]: Report[];
  };
};

export const useMockReports = () => {
  // Dados simulados de relatórios
  const mockReports: Report[] = useMemo(() => [
    {
      id: '101',
      title: 'Relatório Consolidado Set. A254',
      date: '2024-04-10T10:30:00',
      sectorCount: 1,
    },
    {
      id: '102',
      title: 'Relatório Mensal - Recuperação',
      date: '2024-04-05T14:45:00',
      sectorCount: 5,
    },
    {
      id: '103',
      title: 'Relatório Trimestral Filtros',
      date: '2024-03-20T09:15:00',
      sectorCount: 12,
    },
    {
      id: '104',
      title: 'Relatório Set. B789',
      date: '2024-03-15T16:30:00',
      sectorCount: 1,
    },
    {
      id: '105',
      title: 'Relatório Consolidado Março',
      date: '2024-03-01T11:00:00',
      sectorCount: 8,
    },
    {
      id: '106',
      title: 'Relatório Filtros Industriais',
      date: '2024-02-25T13:20:00',
      sectorCount: 3,
    },
    {
      id: '107',
      title: 'Relatório Setores C e D',
      date: '2024-02-10T10:00:00',
      sectorCount: 2,
    },
    {
      id: '108',
      title: 'Relatório Janeiro - Completo',
      date: '2024-01-31T15:45:00',
      sectorCount: 10,
    },
    {
      id: '109',
      title: 'Relatório Set. X123',
      date: '2023-12-15T09:30:00',
      sectorCount: 1,
    },
    {
      id: '110',
      title: 'Relatório Anual 2023',
      date: '2023-12-01T14:00:00',
      sectorCount: 25,
    },
  ], []);

  // Validate reports to ensure they have all required fields
  const validatedReports = useMemo(() => {
    return mockReports.filter(report => 
      report && report.id && report.title && report.date && typeof report.sectorCount === 'number'
    );
  }, [mockReports]);

  // Organizar relatórios por ano e mês
  const reportsByDate: ReportsByDate = useMemo(() => {
    return validatedReports.reduce((acc: ReportsByDate, report) => {
      const date = new Date(report.date);
      const year = date.getFullYear().toString();
      const month = format(date, 'MMMM'); // Nome do mês
      
      if (!acc[year]) {
        acc[year] = {};
      }
      
      if (!acc[year][month]) {
        acc[year][month] = [];
      }
      
      acc[year][month].push(report);
      
      return acc;
    }, {});
  }, [validatedReports]);

  // Ordenar relatórios por data (mais recentes primeiro)
  const sortedReports = useMemo(() => {
    return [...validatedReports].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [validatedReports]);

  return {
    reports: sortedReports,
    reportsByDate,
  };
};
