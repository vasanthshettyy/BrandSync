import React from 'react';
import { 
  Users, 
  Briefcase, 
  FileSignature, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const StatCard = ({ label, value, icon: Icon, colorClass, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse bg-zinc-900/50 border border-white/5 rounded-xl h-32 p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="h-4 w-24 bg-zinc-800 rounded"></div>
          <div className="h-8 w-8 bg-zinc-800 rounded-lg"></div>
        </div>
        <div className="h-8 w-16 bg-zinc-800 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden bg-zinc-900/40 border border-white/10 backdrop-blur-md p-5 rounded-xl shadow-xl transition-all hover:border-white/20">
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
        colorClass
      )} />
      
      <div className="flex justify-between items-start relative z-10">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </p>
        <div className={cn("p-2 rounded-lg bg-zinc-950 border border-white/5", colorClass.replace('bg-', 'text-'))}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="mt-4 relative z-10">
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {value?.toLocaleString() || '0'}
        </h3>
      </div>
    </div>
  );
};

const AdminStatsBanner = ({ stats, isLoading }) => {
  const statConfigs = [
    {
      label: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
      colorClass: "bg-primary"
    },
    {
      label: "Open Gigs",
      value: stats?.openGigs,
      icon: Briefcase,
      colorClass: "bg-blue-500"
    },
    {
      label: "Active Contracts",
      value: stats?.activeContracts,
      icon: FileSignature,
      colorClass: "bg-emerald-500"
    },
    {
      label: "Pending Verifications",
      value: stats?.pendingVerifications,
      icon: AlertTriangle,
      colorClass: "bg-amber-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfigs.map((config, index) => (
        <StatCard 
          key={index}
          {...config}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default AdminStatsBanner;
