import { useRouter } from 'next/navigation';
import { ShimmerButton } from '@/components/ui/shimmer-button';

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="mt-8 bg-white border border-black rounded-xl p-6">
      <h3 className="text-lg font-normal text-black mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ShimmerButton
          onClick={() => router.push('/dashboard/blog-agent')}
        >
          Create Blog Post
        </ShimmerButton>
        <ShimmerButton
          onClick={() => router.push('/dashboard/social-agent')}
        >
          Generate Social Post
        </ShimmerButton>
        <ShimmerButton
          onClick={() => router.push('/dashboard/blog-agent?tab=scheduler')}
        >
          Schedule Content
        </ShimmerButton>
        <ShimmerButton
          onClick={() => router.push('/dashboard/seo')}
        >
          Keyword Research
        </ShimmerButton>
      </div>
    </div>
  );
}
