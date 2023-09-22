import dynamic from 'next/dynamic';

/**
 * Critical: prevents "TypeError: url.replace is not a function" error
 */
const Sample = dynamic(() => import('./Sample.js'), {
  ssr: false,
});

export default function Page() {
  return <Sample />;
}
