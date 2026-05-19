const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`bg-dark-700 rounded animate-pulse ${className}`}
    {...props}
  />
);

export const CardSkeleton = () => (
  <div className="card space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-3 w-2/3" />
    <Skeleton className="h-3 w-1/2" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-6 w-16 rounded-md" />
      <Skeleton className="h-6 w-20 rounded-md" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="p-6 space-y-6">
    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
    {/* Cards */}
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default Skeleton;
