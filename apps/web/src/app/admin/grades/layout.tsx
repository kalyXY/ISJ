import { redirect } from 'next/navigation';

export default function GradesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirect('/admin/bulletins');
}
