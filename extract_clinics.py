import re

with open('app/locations/page.tsx', 'r') as f:
    content = f.read()

match = re.search(r'export const clinics: Clinic\[\] = (\[.*?\]);', content, re.DOTALL)
if match:
    clinics_data = match.group(1)
    with open('app/data/clinics.ts', 'w') as f:
        f.write('export interface Clinic {\n  id: string;\n  name: string;\n  category: string;\n  area: string;\n  address: string;\n  operatingHours: string;\n  phone: string;\n  rating: number;\n  reviewCount: number;\n  reviews: string[];\n  lat: number;\n  lng: number;\n  mapUrl: string;\n  destinationQuery: string;\n}\n\n')
        f.write('export const clinics: Clinic[] = ' + clinics_data + ';\n')
