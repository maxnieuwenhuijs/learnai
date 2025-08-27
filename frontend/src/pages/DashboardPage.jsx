import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ParticipantDashboard } from '@/features/dashboard/ParticipantDashboard';
import { ManagerDashboard } from '@/features/dashboard/ManagerDashboard';
import { AdminDashboard } from '@/features/dashboard/AdminDashboard';

export function DashboardPage() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'participant':
        return <ParticipantDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'admin':
      case 'super_admin':
        return <AdminDashboard />;
      default:
        return <ParticipantDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}