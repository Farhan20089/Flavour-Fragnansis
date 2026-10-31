'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      if (mode === 'signup') {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(result.error || 'Unable to register your client profile.');
          return;
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/account',
      });
      if (!result || result.error) {
        setError(mode === 'signup' ? 'Profile registered, but authentication failed. Please sign in.' : 'Email or password is incorrect.');
        if (mode === 'signup') router.push('/login');
        return;
      }
      router.replace('/account');
      router.refresh();
    } catch {
      setError('A communication error occurred. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {mode === 'signup' && (
        <label className="block space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#171717]">Full Name *</span>
          <input
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Gabriel Vane"
            className="w-full border border-[#171717]/20 bg-white px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#B89555] transition-colors"
          />
        </label>
      )}
      <label className="block space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#171717]">Client Email Address *</span>
        <input
          autoComplete="email"
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="client@domain.com"
          className="w-full border border-[#171717]/20 bg-white px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#B89555] transition-colors"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#171717]">Access Key / Password *</span>
        <input
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          type="password"
          required
          minLength={mode === 'signup' ? 10 : 1}
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••••••"
          className="w-full border border-[#171717]/20 bg-white px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#B89555] transition-colors"
        />
        {mode === 'signup' && (
          <span className="block font-mono text-[9px] text-[#8A857D]">Minimum 10 characters required for atelier vault security.</span>
        )}
      </label>
      {error && (
        <p role="alert" className="border border-red-200 bg-red-50 px-3.5 py-2.5 font-mono text-xs text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#171717] px-4 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-[#FAF8F3] transition-colors hover:bg-[#B89555] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
      >
        {pending ? 'Transmitting…' : mode === 'signup' ? 'Register Account' : 'Authenticate Access'}
      </button>
    </form>
  );
}
