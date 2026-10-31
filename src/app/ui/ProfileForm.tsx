'use client';

import { FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';

export function ProfileForm({ initialName }: { initialName: string }) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setPending(true);
    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const result = (await response.json()) as { user?: { name: string }; error?: string };
      if (!response.ok || !result.user) {
        setError(result.error || 'Unable to update your profile.');
        return;
      }
      await update({ name: result.user.name });
      setMessage('Your profile has been updated.');
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-[#0F2922]">Full name</span>
        <input
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-[#0F2922]/15 bg-[#FAF9F6] px-3 py-2.5 text-sm outline-none focus:border-[#0F2922]"
        />
      </label>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {message && <p role="status" className="text-xs text-emerald-800">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[#0F2922] px-5 py-3 text-xs font-semibold text-[#FAF9F6] hover:bg-[#16382E] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
