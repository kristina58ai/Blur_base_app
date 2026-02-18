import { CreateFlow } from "@/components/CreateFlow";

export default function CreatePage() {
  return (
    <main className="mx-auto min-h-screen max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">BlurPay — Создать контент</h1>
      <CreateFlow />
    </main>
  );
}
