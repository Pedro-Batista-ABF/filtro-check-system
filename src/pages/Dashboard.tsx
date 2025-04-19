
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SummaryCards from '@/components/dashboard/SummaryCards';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <SummaryCards />
      </div>
    </DashboardLayout>
  );
}
