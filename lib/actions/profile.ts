"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function regenerateApiKey() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Generate a realistic professional-looking API key
  const generateSegment = () => Math.random().toString(36).substring(2, 10)
  const newApiKey = `koenci_live_${generateSegment()}${generateSegment()}${generateSegment()}`

  const { error } = await supabase
    .from("profiles")
    .update({ api_key: newApiKey })
    .eq("id", user.id)

  if (error) {
    console.error("Failed to regenerate API key:", error)
    throw new Error("Failed to regenerate API key")
  }

  revalidatePath("/dashboard/settings")
}
