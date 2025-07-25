import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/login');
  // NOTE: redirect is a Next.js utility that ends rendering.
  return null;
}
