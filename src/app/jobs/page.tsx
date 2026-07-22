import { Suspense } from 'react';
import JobsWorkspace from '@/components/jobs/JobsWorkspace';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JobsWorkspace />
    </Suspense>
  );
}
