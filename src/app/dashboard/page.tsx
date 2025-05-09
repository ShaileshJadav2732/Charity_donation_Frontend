'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to Your Dashboard</h1>
        <p className="mt-2 text-gray-600">
          {user?.role === 'donor'
            ? 'Explore charitable organizations and make a difference with your donations.'
            : 'Manage your organization and connect with potential donors.'}
        </p>
      </div>
      
      {user?.role === 'donor' ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">Donor Dashboard</h2>
          <p className="mt-2 text-gray-600">
            This is your donor dashboard. Here you can view and manage your donations.
          </p>
          {/* Add donor-specific dashboard content here */}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">Organization Dashboard</h2>
          <p className="mt-2 text-gray-600">
            This is your organization dashboard. Here you can manage your campaigns and view donations.
          </p>
          {/* Add organization-specific dashboard content here */}
        </div>
      )}
    </div>
  );
}
