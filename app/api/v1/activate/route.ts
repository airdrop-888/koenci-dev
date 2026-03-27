import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, hwid, api_secret } = body;

    // Validate request payload
    if (!key || !hwid || !api_secret) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: key, hwid, api_secret" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Fetch license matching key and include joined project data for api_secret validation
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("*, projects(id, api_secret)")
      .eq("key_string", key)
      .single();

    if (licenseError || !license) {
      return NextResponse.json(
        { success: false, message: "Invalid license key." },
        { status: 404 }
      );
    }

    // Depending on Supabase Schema relation (one-to-many), projects might return as an object or array.
    const project = Array.isArray(license.projects) ? license.projects[0] : license.projects;

    if (!project) {
      return NextResponse.json(
        { success: false, message: "License is not associated with any project." },
        { status: 400 }
      );
    }

    // 2. Validate API Secret matches the Project's API Secret
    if (project.api_secret !== api_secret) {
      return NextResponse.json(
        { success: false, message: "Invalid API secret mapping for this project." },
        { status: 403 }
      );
    }

    // Additional Layer: Deny if banned
    if (license.status === "banned" || license.status === "expired") {
      return NextResponse.json(
        { success: false, message: `License is currently ${license.status}.` },
        { status: 403 }
      );
    }

    // 3 & 4. HWID Validation & Locking logic
    if (license.hwid) {
      // If HWID already exists, it must strictly match the incoming HWID request
      if (license.hwid !== hwid) {
        return NextResponse.json(
          { success: false, message: "Invalid HWID. This license is already locked to another machine." },
          { status: 403 }
        );
      }
      
      // If HWID is correct but status is "unused", we auto-activate it here just in case.
      if (license.status === "unused") {
        await supabase.from("licenses").update({ status: "active" }).eq("id", license.id);
      }
      
    } else {
      // If HWID is NULL (First time activation) -> Update with new HWID and lock it to "active"
      const { error: updateError } = await supabase
        .from("licenses")
        .update({ 
          hwid: hwid, 
          status: "active" 
        })
        .eq("id", license.id);

      if (updateError) {
        console.error("Failed to lock hwid:", updateError);
        return NextResponse.json(
          { success: false, message: "Database error. Failed to map HWID lock for license." },
          { status: 500 }
        );
      }
    }

    // 5. Valid Validation
    return NextResponse.json({ success: true, message: "License activated" });

  } catch (error: any) {
    console.error("Activation API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
