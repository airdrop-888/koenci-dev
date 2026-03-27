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
  
  // Pull the securely authenticated user ID from the session cookie
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized. You must be logged in to create a project.");

  const { error } = await supabase.from("projects").insert([
    {
      name: name,
      api_secret: apiSecret,
      owner_id: user.id,
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
