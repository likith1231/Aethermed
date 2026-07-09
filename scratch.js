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

// Neighborhood coordinates (approximate central points)
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
  "Excellent facility with incredibly caring staff.",
  "Very short wait times and professional doctors.",
  "The clinic was spotless and the consultation felt thorough.",
  "Highly recommend to anyone in the area. Great experience.",
  "Front desk was very helpful and the treatment was effective.",
  "A bit crowded on weekends, but the doctors are top-notch.",
  "Very clear explanation of the diagnosis and treatment plan.",
  "Affordable and high quality care.",
  "Best healthcare experience I've had in a long time.",
  "Always reliable. They truly care about their patients."
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomReviews(count) {
  const shuffled = [...reviewPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Jitter function for coordinates so clinics aren't exactly on top of each other
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
    const prefix = getRandomItem(premiumPrefixes);
    
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
