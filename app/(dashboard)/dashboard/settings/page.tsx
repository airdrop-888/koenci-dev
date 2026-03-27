import { createClient } from "@/lib/supabase/server";
import { CopyToClipboardButton } from "@/components/shared/CopyToClipboardButton";
import { User, Key, Globe } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  // We fetch without auth filter per request, so let's just grab the first profile
  const { data: profiles } = await supabase.from("profiles").select("*").limit(1);
  const profile = profiles?.[0] || {
    id: "N/A",
    full_name: "Developer Admin",
    email: "admin@koenci.dev",
  };

  const apiKey = "koenci_dev_abc123xyz890_dummy_key"; // A dummy API key for display

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
        <p className="text-zinc-400 mt-1">Manage your account and developer settings.</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <User className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-zinc-100">Profile Information</h3>
            <p className="text-sm text-zinc-500">Your personal account details.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Full Name</label>
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3 text-zinc-300 text-sm">
              {profile.full_name}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3 text-zinc-300 text-sm">
              {profile.email}
            </div>
          </div>
        </div>
      </div>

      {/* Developer API Card */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
            <Key className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-amber-500">Developer API Key</h3>
            <p className="text-sm text-amber-500/70">Use this key to authenticate with our REST API.</p>
          </div>
        </div>
        
        <div className="relative z-10 space-y-4">
          <div>
            <label className="block text-xs font-medium text-amber-500/70 mb-1">Secret Key</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/50 border border-amber-500/20 rounded-md p-3 text-amber-200 text-sm font-mono overflow-auto">
                {apiKey}
              </div>
              <CopyToClipboardButton value={apiKey} />
            </div>
            <p className="text-xs text-amber-500/50 mt-2">Never share this key with anyone or expose it in client-side code.</p>
          </div>
        </div>
      </div>

      {/* Webhook Card (Placeholder) */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-500">Webhook URL</h3>
            <p className="text-sm text-blue-500/70">Receive real-time updates when licenses are created or revoked.</p>
          </div>
        </div>
        
        <div className="relative z-10 space-y-4">
          <div>
            <label className="block text-xs font-medium text-blue-500/70 mb-1">Endpoint URL (Coming Soon)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                disabled 
                placeholder="https://your-domain.com/api/webhooks" 
                className="flex-1 bg-black/50 border border-blue-500/20 rounded-md p-3 text-blue-200 text-sm opacity-50 cursor-not-allowed outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            <p className="text-xs text-blue-500/50 mt-2">Webhook integration is not fully activated yet.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
