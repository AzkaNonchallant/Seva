import { Card } from "@/components/ui/card";
import { LoadingState, SkeletonRows } from "@/components/ui/empty-state";

/**
 * Streamed while a Travel Admin screen awaits its API calls. Mirrors the real
 * layout closely enough that the transition does not jump.
 */
export default function TravelAdminLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-outline-variant/20 bg-surface-container-lowest" />
      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <LoadingState label="Memuat data dinas travel..." />

        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[148px] animate-pulse rounded-2xl bg-surface-container"
            />
          ))}
        </div>

        <Card>
          <SkeletonRows rows={5} />
        </Card>
      </main>
    </div>
  );
}
