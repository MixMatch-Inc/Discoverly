import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ textAlign: 'center' }}>
      <h1>Discoverly</h1>
      <p>
        <Link href="/login">Log in</Link> or <Link href="/register">create an account</Link>.
      </p>
    </main>
  );
}
