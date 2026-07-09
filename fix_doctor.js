const fs = require('fs');
let lines = fs.readFileSync('app/doctor/page.tsx', 'utf8').split('\n');
// Remove gatekeeper wall
const start = lines.findIndex(l => l.includes('// Gatekeeper Access Wall'));
let end = -1;
for (let i = start; i < lines.length; i++) {
  if (lines[i].includes('// Find My Clinic Data')) {
    end = i - 1;
    break;
  }
}
if (start !== -1 && end !== -1) {
  lines.splice(start, end - start + 1);
}

// Replace session in doctorId
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('doctorId: (session?.user as any)?.id')) {
    lines[i] = lines[i].replace('doctorId: (session?.user as any)?.id', 'doctorId: "doc-1"');
  }
}

fs.writeFileSync('app/doctor/page.tsx', lines.join('\n'));
console.log("Fixed app/doctor/page.tsx");
