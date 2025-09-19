import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardDetails {
  projectsCompleted: number;
  tasksAssigned: number;
  recentActivity: string[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [details, setDetails] = useState<DashboardDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Retrieve logged-in user email (stored after login)
  const email = localStorage.getItem('email') || 'emily.chen@example.com';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/dashboard/${email}`);
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data: DashboardDetails = await res.json();
        setDetails(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600 animate-pulse">Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Login
        </Button>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <p className="text-gray-700 text-lg">No dashboard data available.</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            User Dashboard
          </h1>
          <div className="space-x-2">
            <Button variant="secondary" onClick={() => navigate('/')}>
              Go to Home
            </Button>
            <Button variant="destructive" onClick={() => navigate('/login')}>
              Logout
            </Button>
          </div>
        </header>

        {/* Dashboard Summary */}
        <Card className="p-8 shadow-xl bg-white rounded-2xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Projects Completed</p>
              <p className="text-3xl font-bold text-blue-700">
                {details.projectsCompleted}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Tasks Assigned</p>
              <p className="text-3xl font-bold text-green-700">
                {details.tasksAssigned}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Recent Activity
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {details.recentActivity.map((activity, idx) => (
                <li key={idx}>{activity}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 pt-4">
          © {new Date().getFullYear()} Employee Management App. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
