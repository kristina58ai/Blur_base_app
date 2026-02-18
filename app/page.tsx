import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">BlurPay</h1>
      <p className="mt-2 text-gray-600">Pay-to-Reveal на Base</p>
      <Link
        href="/create"
        className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Создать контент
      </Link>
    </main>
  );
}
