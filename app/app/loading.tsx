export default function AppLoading() {
    return (
        <div className="animate-fade-in space-y-6">
            {/* Skeleton header */}
            <div className="h-24 rounded-2xl bg-surface border border-line shimmer-bg" />
            {/* Skeleton cards row */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-surface border border-line" />
                ))}
            </div>
            {/* Skeleton content */}
            <div className="h-64 rounded-2xl bg-surface border border-line" />
        </div>
    );
}
