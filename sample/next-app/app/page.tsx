'use client';

import dynamic from 'next/dynamic';

const Sample = dynamic(() => import('./Sample'), {
  ssr: false,
});

export default function Page() {
  return <Sample />;
}
