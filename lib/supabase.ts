import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Supabase client с service_role — для API routes.
 * Используется для: private bucket, signed URLs, все операции Storage.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/** Имена bucket'ов (создать в Supabase Dashboard) */
export const BUCKETS = {
  blurred: "blurred",
  originals: "originals",
  metadata: "metadata",
} as const;
