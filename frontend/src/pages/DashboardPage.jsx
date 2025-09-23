import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ParticipantDashboard } from "@/features/dashboard/ParticipantDashboard";
import { ManagerDashboard } from "@/features/dashboard/ManagerDashboard";
import { AdminDashboard as AdminDashboardFeature } from "@/features/dashboard/AdminDashboard";

export function DashboardPage() {
	const { user } = useAuth();

	const renderDashboard = () => {
		switch (user?.role) {
			case "participant":
				return <ParticipantDashboard />;
			case "manager":
				return <ManagerDashboard />;
			case "admin":
				return <AdminDashboardFeature />;
			case "super_admin":
				// Super admins should go directly to Platform Admin, not dashboard
				window.location.href = "/admin/super-admin";
				return null;
			default:
				return <ParticipantDashboard />;
		}
	};

	return <DashboardLayout>{renderDashboard()}</DashboardLayout>;
}
