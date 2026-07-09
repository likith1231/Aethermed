const fs = require('fs');

const clinicsCount = {
  allopathy: 34,
  ayurveda: 19,
  homeopathy: 29,
  veterinary: 23
};

const hours = [
  "Mon-Sat: 8:00 AM - 8:00 PM | Sun: Closed",
  "Mon-Fri: 9:00 AM - 9:00 PM | Sat: 9:00 AM - 5:00 PM | Sun: Closed",
  "Mon-Sun: 24/7 Emergency Care",
  "Mon-Sat: 10:00 AM - 7:00 PM | Sun: 10:00 AM - 2:00 PM",
  "Tue-Sun: 9:00 AM - 6:00 PM | Mon: Closed"
];

const neighborhoodCoords = {
  "Indiranagar": { lat: 12.9784, lng: 77.6408 },
  "Koramangala": { lat: 12.9352, lng: 77.6245 },
  "Whitefield": { lat: 12.9699, lng: 77.7499 },
  "Jayanagar": { lat: 12.9299, lng: 77.5824 },
  "Malleshwaram": { lat: 13.0031, lng: 77.5643 },
  "HSR Layout": { lat: 12.9121, lng: 77.6446 },
  "Electronic City": { lat: 12.8452, lng: 77.6602 },
  "Rajajinagar": { lat: 12.9982, lng: 77.5530 },
  "Banashankari": { lat: 12.9255, lng: 77.5468 },
  "Hebbal": { lat: 13.0354, lng: 77.5988 },
  "Marathahalli": { lat: 12.9569, lng: 77.7011 },
  "Domlur": { lat: 12.9609, lng: 77.6387 },
  "Sadashivanagar": { lat: 13.0068, lng: 77.5813 },
  "BTM Layout": { lat: 12.9166, lng: 77.6101 },
  "Kalyan Nagar": { lat: 13.0280, lng: 77.6399 },
  "Yeshwanthpur": { lat: 13.0285, lng: 77.5401 }
};

const neighborhoods = Object.keys(neighborhoodCoords);
const surnames = ["Rao", "Shetty", "Hegde", "Reddy", "Das", "Nair", "Kumar", "Fernandez", "Joshi", "Prasad", "Murthy", "Gowda", "Alva"];
const premiumPrefixes = ["Apollo Spectra", "Narayana Partner", "CareMax", "MedPlus", "Lifeline", "PrimeCare", "Vasan", "TrustWell", "Dr. Batra's", "AyurVAID", "Cessna", "Cessna Lifeline", "Happy Paws", "Greenpet"];

const reviewPool = [
  "Dr. Hegde was fantastic with my grandmother's checkup. The clinic was crowded on a Saturday morning, so we had to wait 20 mins past our slot, but the care was top-notch.",
  "Clean facility. Booked an emergency slot for my pup's paw injury at 2 AM. Staff was calm, professional, and handled the situation instantly. Rates are transparent.",
  "Been visiting this Ayurveda center for chronic back pain. Authentic treatments. The medicine smells strong but it actually works. Deducted one star because parking is a nightmare in this area.",
  "Great diagnosis by the physician, didn't prescribe unnecessary antibiotics which I appreciate. Reception desk could be a bit more polite though.",
  "The doctor spent a good 15 minutes explaining my test reports in detail. Highly empathetic. Finding a parking spot near the building took forever, plan to arrive early.",
  "Took my cat here for her annual vaccinations. The vet was incredibly gentle and the whole process took barely 10 minutes. Will definitely make this our regular vet.",
  "I've been going to this homeopathic clinic for my severe allergies. While the results are slow, the doctor is very patient and listens to all symptoms thoroughly.",
  "Very prompt service for my routine blood work. The phlebotomist was skilled, didn't feel a thing. The AC in the waiting room was blasting too cold, but otherwise good.",
  "A lifesaver in our neighborhood. Brought my kid in with high fever late at night and the on-duty doctor handled it with so much care and expertise.",
  "Overall decent experience. The consultation was fine, but the pharmacy attached didn't have the prescribed medicines in stock so I had to hunt for them elsewhere.",
  "Highly professional setup. They use a neat digital token system so you know exactly when your turn is. The waiting area is spacious and well-lit.",
  "The Ayurvedic massage therapy for my joint pain was incredibly relaxing and effective. The therapists are well-trained. A bit on the pricey side, but worth it.",
  "Had a mixed experience. The doctor was undoubtedly knowledgeable, but the clinic was extremely noisy and chaotic. Took 45 minutes just to get the bill sorted.",
  "Absolutely wonderful pediatric care. The doctors know how to keep children engaged and calm during checkups. They even have a small play area which helps a lot."
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomReviews(count) {
  const shuffled = [...reviewPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function applyJitter(val, range = 0.005) {
  return val + (Math.random() * range * 2) - range;
}

let clinics = [];
let idCounter = 1;

for (const [category, count] of Object.entries(clinicsCount)) {
  for (let i = 0; i < count; i++) {
    const area = getRandomItem(neighborhoods);
    const hour = getRandomItem(hours);
    const surname = getRandomItem(surnames);
    
    let name = "";
    const randSchema = Math.random();
    
    if (category === "veterinary") {
      if (randSchema < 0.33) {
        name = `Dr. ${surname}'s Pet Care Clinic`;
      } else if (randSchema < 0.66) {
        const vetPrefix = getRandomItem(["Cessna", "Cessna Lifeline", "Happy Paws", "Greenpet"]);
        name = `${vetPrefix} Vet Centre - ${area}`;
      } else {
        name = `${area} Pet Hospital & Emergency Vet Hub`;
      }
    } else if (category === "ayurveda") {
      if (randSchema < 0.33) {
        name = `Dr. ${surname}'s Ayurvedic Healing Centre`;
      } else if (randSchema < 0.66) {
        const ayurPrefix = getRandomItem(["AyurVAID", "Patanjali", "Kottakkal", "TrustWell"]);
        name = `${ayurPrefix} Ayurveda - ${area}`;
      } else {
        name = `Prakriti ${area} Ayurvedic Kendra`;
      }
    } else if (category === "homeopathy") {
      if (randSchema < 0.33) {
        name = `Dr. ${surname}'s Homeo Clinic`;
      } else if (randSchema < 0.66) {
        const homeoPrefix = getRandomItem(["Dr. Batra's", "Positive Homeopathy", "CareMax"]);
        name = `${homeoPrefix} Clinic - ${area}`;
      } else {
        name = `${area} Comprehensive Homeopathy Center`;
      }
    } else {
      if (randSchema < 0.33) {
        name = `Dr. ${surname}'s Family Clinic & Diagnostic Centre`;
      } else if (randSchema < 0.66) {
        const alloPrefix = getRandomItem(["Apollo Spectra", "Narayana Partner", "MedPlus", "Lifeline", "PrimeCare"]);
        name = `${alloPrefix} Healthcare Centre - ${area}`;
      } else {
        name = `${area} Comprehensive Care & Specialized Clinic`;
      }
    }
    
    const lat = applyJitter(neighborhoodCoords[area].lat);
    const lng = applyJitter(neighborhoodCoords[area].lng);

    clinics.push({
      id: `clinic-${idCounter++}`,
      name: name,
      category: category,
      area: area,
      address: `${Math.floor(Math.random() * 100) + 1} Main Road, ${area}, Bengaluru, KA 5600${Math.floor(Math.random() * 90) + 10}`,
      phone: `+91 80 4967 ${Math.floor(1000 + Math.random() * 9000)}`,
      operatingHours: hour,
      rating: +(Math.random() * 0.8 + 4.1).toFixed(1), // 4.1 to 4.9
      reviewCount: Math.floor(Math.random() * 225) + 15, // 15 to 240
      reviews: getRandomReviews(Math.floor(Math.random() * 2) + 2), // 2 or 3 reviews
      lat: lat,
      lng: lng,
      mapUrl: `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15552.000000000000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin`,
      destinationQuery: `${area} Bengaluru`
    });
  }
}

// Randomize array
clinics.sort(() => Math.random() - 0.5);

fs.writeFileSync('clinics_data.json', JSON.stringify(clinics, null, 2));
