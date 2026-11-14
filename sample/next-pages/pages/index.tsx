import dynamic from 'next/dynamic';

const Sample = dynamic(() => import('../components/Sample'), {
  ssr: false,
});

export default function Page() {
  return <Sample />;
}
