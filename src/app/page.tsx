import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-center">
      <h1 className="mb-4 text-5xl font-bold text-white">
        🎯 Candidex
      </h1>
      <p className="mb-2 text-xl text-zinc-300">
        AI-Powered Job Search Operating System
      </p>
      <p className="mb-8 max-w-md text-zinc-500">
        Create tailored Job Packs for each application. Brutally honest feedback.
        No fabrication. ATS-safe exports.
      </p>
      <div className="flex gap-4">
        <Link href="/signup">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/login">
          <Button size="lg" variant="outline">Sign In</Button>
        </Link>
      </div>
    </div>
  );
}
