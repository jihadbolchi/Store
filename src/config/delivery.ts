/**
 * Delivery and Store Configuration for Dhaka Art Nook
 * Easily customize delivery fees, contact details, and store policies here.
 */

export interface DeliveryOption {
  id: 'inside_dhaka' | 'outside_dhaka';
  name: string;
  description: string;
  fee: number; // in BDT (৳)
  estimatedDelivery: string;
}

export const DELIVERY_CONFIG = {
  // Automatic Delivery Charges
  insideDhaka: {
    id: 'inside_dhaka' as const,
    name: 'Inside Dhaka City',
    description: 'Home delivery across all Dhaka metro zones (Dhanmondi, Gulshan, Uttara, Mirpur, Old Dhaka, etc.)',
    fee: 80, // ৳80 inside Dhaka
    estimatedDelivery: '24 – 48 Hours',
  },
  outsideDhaka: {
    id: 'outside_dhaka' as const,
    name: 'Outside Dhaka (Nationwide)',
    description: 'Currier service to all 64 districts in Bangladesh (Sundarban / Steadfast / Pathao courier)',
    fee: 130, // ৳130 outside Dhaka
    estimatedDelivery: '2 – 4 Working Days',
  },

  // Free delivery threshold: orders at or above this subtotal qualify for free delivery.
  freeDeliveryThreshold: 3500,

  // WhatsApp Order Config
  whatsapp: {
    phoneNumber: '01626523338',
    internationalNumber: '8801626523338',
    waUrlBase: 'https://wa.me/8801626523338',
    businessHours: '10:00 AM – 10:00 PM (Daily)',
  },

  // Social Links
  socials: {
    instagram: 'https://instagram.com/dhaka_art_nook',
    instagramHandle: '@dhaka_art_nook',
    facebook: 'https://facebook.com/dhakaartnook',
    facebookPageName: 'Dhaka Art Nook',
    email: 'support@dhakaartnook.com',
  },

  // Store Location
  store: {
    name: 'Dhaka Art Nook',
    tagline: 'Your Home for DIY, Art & Craft Supplies',
    address: 'Artisan Hub, Lalmatia Block D, Dhaka 1207, Bangladesh',
    city: 'Dhaka',
    country: 'Bangladesh',
    currency: '৳',
    currencyCode: 'BDT',
  },

  // Brand Values
  brandValues: [
    {
      title: 'DIY & Creation',
      description: 'Empowering local makers, students, hobbyists, and professional artists with world-class supplies.',
      icon: 'Palette',
    },
    {
      title: 'Quality You Can Trust',
      description: 'Strictly tested epoxy resins, lightfast artist pigments, pure soy wax, and seasoned sheesham wood blocks.',
      icon: 'ShieldCheck',
    },
    {
      title: 'Made with Passion',
      description: 'Hand-picked by practicing artisans who understand the tactile joy of handmade craft.',
      icon: 'HeartHandshake',
    },
    {
      title: 'Support Local Art & Craft',
      description: 'Collaborating with traditional Bangladeshi wood-carvers, potters, and indie artisan workshops.',
      icon: 'Sparkles',
    },
  ],
};
