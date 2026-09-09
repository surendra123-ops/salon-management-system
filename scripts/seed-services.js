require('dotenv').config();
const mongoose = require('mongoose');

const SALON_ID = '6a9fb608bdfdf545b4d5770c';

const services = [
  { name: "Men's Hair Cut", price: 120, category: "Men's Services" },
  { name: "Foam Shave", price: 70, category: "Men's Services" },
  { name: "Head Massage", price: 100, category: "Men's Services" },
  { name: "D-Tan", price: 300, category: "Men's Services" },
  { name: "Facials (Starts)", price: 499, category: "Facial & Body" },
  { name: "Hair Spa (Starts)", price: 399, category: "Facial & Body" },
  { name: "Full Body Massage", price: 999, category: "Facial & Body" },
  { name: "Make Up (Starts)", price: 1999, category: "Facial & Body" },
  { name: "Eyebrows", price: 49, category: "Women's Services" },
  { name: "D-Tan Facials", price: 300, category: "Women's Services" },
  { name: "Waxing", price: 449, category: "Women's Services" },
  { name: "Hydro Facial", price: 1499, category: "Women's Services" },
  { name: "Hair Cut (Starts)", price: 499, category: "Women's Services" },
  { name: "Pedicure (Starts)", price: 499, category: "Women's Services" },
  { name: "Hair Spa (Starts)", price: 849, category: "Women's Services" },
  { name: "Makeup (Starts)", price: 2499, category: "Women's Services" },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'salon' });
  const Service = require('../models/Service');

  let created = 0;
  let skipped = 0;

  for (const svc of services) {
    const existing = await Service.findOne({
      salonId: SALON_ID,
      name: { $regex: new RegExp("^" + svc.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") },
      price: svc.price,
    });

    if (existing) {
      skipped++;
      continue;
    }

    await Service.create({
      salonId: SALON_ID,
      name: svc.name,
      category: svc.category,
      price: svc.price,
      image: null,
    });
    created++;
  }

  const total = await Service.countDocuments({ salonId: SALON_ID });
  console.log(`Created: ${created}, Skipped (existing): ${skipped}, Total in DB: ${total}`);

  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
