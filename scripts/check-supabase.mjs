/**
 * Проверка Supabase: подключение и список bucket'ов.
 * Запуск: node scripts/check-supabase.mjs
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  console.log("Проверка Supabase...\n");

  if (!url || !key) {
    console.error("Ошибка: в .env.local нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  console.log("URL:", url);
  console.log("Key:", key.slice(0, 12) + "...\n");

  const supabase = createClient(url, key);

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error("Ошибка при запросе к Supabase:", error.message);
    process.exit(1);
  }

  console.log("Подключение OK. Buckets:");
  if (buckets && buckets.length > 0) {
    buckets.forEach((b) => console.log("  -", b.name, b.public ? "(public)" : "(private)"));
  } else {
    console.log("  (пока нет bucket'ов)");
  }

  const required = ["blurred", "originals", "metadata"];
  const names = (buckets || []).map((b) => b.name);
  const missing = required.filter((r) => !names.includes(r));
  if (missing.length > 0) {
    console.log("\nДля приложения нужны bucket'ы:", missing.join(", "));
    console.log("Создай их в Supabase Dashboard → Storage → New bucket.");
  } else {
    console.log("\nВсе нужные bucket'ы есть.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
