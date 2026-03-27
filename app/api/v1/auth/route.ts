import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, license: licenseKey, hwid } = body;

    // Validate request payload
    if (!secret || !licenseKey || !hwid) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: secret, license, hwid" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Find Project matching the provided api_secret
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("api_secret", secret)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Invalid Project Secret." },
        { status: 401 }
      );
    }

    // 2. Find License matching the key_string AND ensuring it belongs to the matched project
    const { data: licenseRow, error: licenseError } = await supabase
      .from("licenses")
      .select("*")
      .eq("key_string", licenseKey)
      .eq("project_id", project.id)
      .single();

    if (licenseError || !licenseRow) {
      return NextResponse.json(
        { success: false, message: "Invalid or nonexistent license key for this project." },
        { status: 404 }
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
          id: project.id,
          name: project.name,
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
