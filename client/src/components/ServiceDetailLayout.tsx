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
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="text-muted-foreground hover:text-foreground transition"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className={`flex items-center justify-center w-16 h-16 ${colorClasses[color]} rounded-lg`}>
            <span className="material-symbols-outlined text-4xl">{icon}</span>
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-sidebar-dark rounded-xl p-6 border border-gray-200 dark:border-transparent">
        {children}
      </div>
    </div>
  );
}
