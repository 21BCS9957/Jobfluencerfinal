import { Suspense } from 'react';
import CreatorDirectoryWorkspace from '@/components/creators/CreatorDirectoryWorkspace';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CreatorDirectoryWorkspace />
    </Suspense>
  );
}
