import React from 'react';
import { Activity, Users, FileText, Settings } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';

const UserPage: React.FC = () => {
  const stats = [
    { name: 'Active Users', value: '2,543', icon: Users },
    { name: 'New Documents', value: '45', icon: FileText },
    { name: 'System Health', value: '98%', icon: Activity },
    { name: 'Settings Updated', value: 'Today', icon: Settings },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Welcome back, John</h1>
            <p className="mt-2 text-secondary">Here's what's happening with your projects today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/5 rounded-[5px]">
                      <Icon className="h-6 w-6 text-primary" strokeWidth={1} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-secondary">{stat.name}</p>
                      <p className="text-2xl font-semibold text-primary">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-white rounded-[5px] p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-primary mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center py-3 border-b border-gray-100 last:border-0">
                  <div className="h-8 w-8 rounded-[5px] bg-primary/5 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" strokeWidth={1} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-primary">System Update Completed</p>
                    <p className="text-xs text-secondary">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default UserPage;