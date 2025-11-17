import { ReactNode } from 'react';

interface ServiceDetailLayoutProps {
  title: string;
  description: string;
  icon: string;
  color?: string;
  children: ReactNode;
}

export default function ServiceDetailLayout({
  title,
  description,
  icon,
  color = 'purple',
  children
}: ServiceDetailLayoutProps) {

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    orange: 'bg-orange-500/20 text-orange-400',
    pink: 'bg-pink-500/20 text-pink-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    red: 'bg-red-500/20 text-red-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="text-[#ab9eb7] hover:text-white transition"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className={`flex items-center justify-center w-16 h-16 ${colorClasses[color]} rounded-lg`}>
            <span className="material-symbols-outlined text-4xl">{icon}</span>
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">{title}</h1>
            <p className="text-[#ab9eb7] text-sm">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-sidebar-dark rounded-xl p-6">
        {children}
      </div>
    </div>
  );
}
