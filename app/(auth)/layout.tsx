// app/(auth)/layout.tsx overrides global layout to remove dashboard specific styles if necessary, 
// though we usually put standard wrappers. Since we already have a root layout for globals, 
// we will just export children as is to bypass the (dashboard) sidebar setup.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
