"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateLicense(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  if (!projectId) throw new Error("Missing project ID");

  const supabase = await createClient();

  // Generate a random key format: KNC-XXXX-XXXX-XXXX
  const generateSegment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const keyString = `KNC-${generateSegment()}-${generateSegment()}-${generateSegment()}`;

  const { error } = await supabase.from("licenses").insert([
    {
      project_id: projectId,
      key_string: keyString,
      status: "unused",
      // Optional defaults depending on schema
    }
  ]);

  if (error) {
    console.error("Failed to generate license:", error);
    throw new Error("Failed to generate license");
  }

  // Revalidate the project details page
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard`);
}
