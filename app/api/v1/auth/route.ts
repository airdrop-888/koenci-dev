import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, license: licenseKey, hwid, ownerId } = body;

    // Validate request payload
    if (!secret || !licenseKey || !hwid || !ownerId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: secret, license, hwid, ownerId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Validate Secret against global Developer API Key OR Project API Secret
    let targetProjectId = null;
    let masterAdminId = null;

    // First try: Is it a global Master Developer API Key?
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("api_key", secret)
      .single();

    if (profile) {
      masterAdminId = profile.id;
    } else {
      // Second try: Is it a specific Project API Secret?
      const { data: project } = await supabase
        .from("projects")
        .select("id, owner_id")
        .eq("api_secret", secret)
        .single();
      
      if (project) {
        if (project.owner_id !== ownerId) {
          return NextResponse.json(
            { success: false, message: "Unauthorized. Passed ownerId does not match the application owner." },
            { status: 401 }
          );
        }
        targetProjectId = project.id;
      } else {
        return NextResponse.json(
          { success: false, message: "Unauthorized. Invalid Secret or API Key." },
          { status: 401 }
        );
      }
    }

    if (masterAdminId && masterAdminId !== ownerId) {
       return NextResponse.json(
         { success: false, message: "Unauthorized. Passed ownerId does not match the Developer Key owner." },
         { status: 401 }
       );
    }

    // 2. Find License matching the key_string
    let licenseQuery = supabase
      .from("licenses")
      .select("*, projects(id, name, owner_id)")
      .eq("key_string", licenseKey);

    // If using Project Secret, hardcode the scope to that project
    if (targetProjectId) {
      licenseQuery = licenseQuery.eq("project_id", targetProjectId);
    }

    const { data: licenseRow, error: licenseError } = await licenseQuery.single();

    if (licenseError || !licenseRow) {
      return NextResponse.json(
        { success: false, message: "Invalid or nonexistent license key." },
        { status: 404 }
      );
    }

    // Safely extract project relational data
    const projectRel = Array.isArray(licenseRow.projects) ? licenseRow.projects[0] : licenseRow.projects;

    // If using Master Key, verify that this developer actually owns the project this license belongs to
    if (masterAdminId && (!projectRel || projectRel.owner_id !== masterAdminId)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. You do not own the project this license belongs to." },
        { status: 403 }
      );
    }

    // 3. Check License Status (Deny if banned or expired)
    if (licenseRow.status === "banned" || licenseRow.status === "expired") {
      return NextResponse.json(
        { success: false, message: `Access denied. License is currently ${licenseRow.status}.` },
        { status: 403 }
      );
    }

    // 4. HWID Checking and Locking Logic
    if (licenseRow.hwid) {
      // HWID exists -> MUST match incoming request
      if (licenseRow.hwid !== hwid) {
        return NextResponse.json(
          { success: false, message: "HWID Mismatch. This license is locked to another device." },
          { status: 403 }
        );
      }
      
      // Optional safety: If the HWID matches but it's somehow "unused", set to active
      if (licenseRow.status === "unused") {
        await supabase.from("licenses").update({ status: "active" }).eq("id", licenseRow.id);
      }

    } else {
      // HWID is NULL -> First-time authentication (Locking phase)
      const { error: lockError } = await supabase
        .from("licenses")
        .update({ 
          hwid: hwid, 
          status: "active" 
        })
        .eq("id", licenseRow.id);

      if (lockError) {
        console.error("Locking error:", lockError);
        return NextResponse.json(
          { success: false, message: "Failed to bind HWID to this license." },
          { status: 500 }
        );
      }
    }

    // 5. Respond with Success Information
    return NextResponse.json({
      success: true,
      message: "Authentication successful.",
      data: {
        project: {
          id: projectRel.id,
          name: projectRel.name,
        },
        license: {
          key: licenseRow.key_string,
          status: licenseRow.hwid ? licenseRow.status : "active",
          hwid: hwid,
          expires_at: licenseRow.expires_at || "Lifetime",
          created_at: licenseRow.created_at,
        }
      }
    });

  } catch (error: any) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
