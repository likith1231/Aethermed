import re

with open('app/doctor/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove next-auth imports
content = re.sub(r'import { signIn, useSession, signOut } from "next-auth/react";\n', '', content)

# 2. Remove session and login states
content = re.sub(r'  const { data: session, status } = useSession\(\);\n  const isAuthenticated = status === "authenticated";\n', '', content)

login_state_pattern = r'  // Login State\n  const \[license.*?setIsVerificationModalOpen\(false\);\n'
# Actually it's easier to just do string replacements

# Let's replace the top part manually
content = content.replace('''  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [activeTab, setActiveTab] = useState("Dashboard");
  
  // Login State
  const [license, setLicense] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);''', 
'''  const [activeTab, setActiveTab] = useState("Dashboard");''')

# Replace useEffect and handleLogin
old_use_effect = '''  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password: pin,
      redirect: false,
    });
    
    if (result?.error) {
      setLoginError("❌ Access Denied: Invalid Credentials.");
    } else {
      setLoginError("");
      // Set the mock context to "logged in" so the rest of the page UI logic holds together
      loginDoctor("doc-1", "clinic-10"); 
    }
  };'''

new_use_effect = '''  useEffect(() => {
    if (localStorage.getItem("aether_doctor_authenticated") !== "true") {
      window.location.replace("/doctor/auth");
    } else {
      setIsMounted(true);
      loginDoctor("doc-1", "clinic-10"); 
    }
  }, []);'''

content = content.replace(old_use_effect, new_use_effect)

# Remove the gatekeeper access wall
gatekeeper_start = '  // Gatekeeper Access Wall\n  if (!isAuthenticated) {'
gatekeeper_end = '        </div>\n      )}\n    </div>\n  );'
gatekeeper_end2 = '        </div>\n      )}\n    </div>\n  );\n'

# Find indices
start_idx = content.find(gatekeeper_start)
if start_idx != -1:
    end_idx = content.find(gatekeeper_end, start_idx)
    if end_idx != -1:
        # We need to find the matching closing brace for if(!isAuthenticated)
        # It's easier to just use regex to remove everything from Gatekeeper Access Wall down to the return ( for the actual dashboard
        dashboard_return_idx = content.find('  return (\n    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">', start_idx)
        if dashboard_return_idx != -1:
            content = content[:start_idx] + content[dashboard_return_idx:]

# Update logout button
old_logout = '''              <button
                onClick={() => {
                  logout();
                  signOut({ redirect: false }).then(() => {
                    window.location.href = '/';
                  });
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-red-500 hover:text-red-700 transition-colors ml-2"
              >
              Sign Out
            </button>'''

new_logout = '''              <button
                onClick={() => {
                  logout();
                  localStorage.removeItem('aether_doctor_authenticated');
                  localStorage.removeItem('aether_admin_authenticated');
                  window.location.href = '/';
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-red-500 hover:text-red-700 transition-colors ml-2"
              >
              Sign Out
            </button>'''

content = content.replace(old_logout, new_logout)

with open('app/doctor/page.tsx', 'w') as f:
    f.write(content)

print("Doctor page refactored.")
