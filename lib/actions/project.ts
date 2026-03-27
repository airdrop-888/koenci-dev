"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) throw new Error("Missing project name");

  const supabase = await createClient();

  // Auto-generate api_secret koenci_XXXXXX
  const generateSegment = () => Math.random().toString(36).substring(2, 10);
  const apiSecret = `koenci_${generateSegment()}${generateSegment()}`;
  
  // Let's grab the first available profile ID to avoid Foreign Key Constraint errors.
  // If none exist, fallback to the requested dummy ID.
  const { data: profile } = await supabase.from("profiles").select("id").limit(1).single();
  const validOwnerId = profile?.id || "00000000-0000-0000-0000-000000000000";

  const { error } = await supabase.from("projects").insert([
    {
      name: name,
      api_secret: apiSecret,
      owner_id: validOwnerId,
    }
  ]);

  if (error) {
    console.error("Failed to create project:", error);
    throw new Error(`DB Error: ${error.message} - ${error.details || ""}`);
  }

  // Revalidate to update dashboard numbers and lists instantly
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/projects`);
}
