'use client';

import dynamic from 'next/dynamic';

const Sample = dynamic(() => import('./Sample.js'), {
  ssr: false,
});

export default function Page() {
  return <Sample />;
}
