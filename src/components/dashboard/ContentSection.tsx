import { LoadingSkeleton } from './LoadingSkeleton';

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  loading?: boolean;
  skeletonCount?: number;
}

export function ContentSection({ 
  title, 
  children, 
  action, 
  loading = false, 
  skeletonCount = 3 
}: ContentSectionProps) {
  return (
    <div className="bg-white border border-black rounded-xl overflow-hidden">
      <div className="border-b border-black px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-black">{title}</h3>
        {action}
      </div>
      <div className="p-6">
        {loading ? <LoadingSkeleton count={skeletonCount} /> : children}
      </div>
    </div>
  );
}
