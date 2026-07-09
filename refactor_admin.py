import re

with open('app/admin/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove next-auth imports
content = re.sub(r'import { signIn, useSession, signOut } from "next-auth/react";\n', '', content)

# 2. Replace states
content = content.replace('''  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [activeTab, setActiveTab] = useState("Overview");

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");''', 
'''  const [activeTab, setActiveTab] = useState("Overview");''')

# 3. Replace useEffect and handleLogin
old_use_effect = '''  useEffect(() => {
    setIsMounted(true);
  }, []);

  const clearAllBookings = () => {
    setBookings([]);
    showToast("All bookings have been successfully cleared.", "success");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    if (result?.error) {
      setLoginError("❌ Access Denied: Unauthorized Personnel.");
    } else {
      setLoginError("");
      loginAdmin();
    }
  };'''

new_use_effect = '''  useEffect(() => {
    if (localStorage.getItem("aether_admin_authenticated") !== "true") {
      window.location.replace("/admin/auth");
    } else {
      setIsMounted(true);
      loginAdmin();
    }
  }, []);

  const clearAllBookings = () => {
    setBookings([]);
    showToast("All bookings have been successfully cleared.", "success");
  };'''

content = content.replace(old_use_effect, new_use_effect)

# 4. Remove Gatekeeper
gatekeeper_start = '  if (!isAuthenticated) {'
dashboard_return_idx = content.find('  return (\n    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">', content.find(gatekeeper_start))
if dashboard_return_idx != -1:
    content = content[:content.find(gatekeeper_start)] + content[dashboard_return_idx:]

# 5. Update logout button
old_logout = '''              <button
                onClick={() => {
                  logout();
                  signOut({ redirect: false }).then(() => {
                    window.location.href = '/';
                  });
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-red-500 hover:text-red-700 transition-colors ml-2 flex items-center gap-2"
              >'''

new_logout = '''              <button
                onClick={() => {
                  logout();
                  localStorage.removeItem('aether_doctor_authenticated');
                  localStorage.removeItem('aether_admin_authenticated');
                  window.location.href = '/';
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-red-500 hover:text-red-700 transition-colors ml-2 flex items-center gap-2"
              >'''

content = content.replace(old_logout, new_logout)

with open('app/admin/page.tsx', 'w') as f:
    f.write(content)

print("Admin page refactored.")
