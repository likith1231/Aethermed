import re

with open('app/locations/page.tsx', 'r') as f:
    content = f.read()

# Replace the interface and array with the import statement
new_content = re.sub(
    r'interface Clinic \{.*?export const clinics: Clinic\[\] = \[.*?\];\n',
    'import { clinics, Clinic } from "../data/clinics";\n',
    content,
    flags=re.DOTALL
)

with open('app/locations/page.tsx', 'w') as f:
    f.write(new_content)
