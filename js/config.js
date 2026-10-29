/*
  ───────────────────────────────────────────────────────────────
  WEDDING DETAILS — edit this file only.
  Everything on the website (names, dates, events, venue, RSVP)
  is read from here.

  Photos: put your images in  assets/photos/  with the file names
  used below (or change the names here). Any photo that is missing
  shows an ornamental placeholder, so the site never looks broken.

  Personal links for relatives:
    https://<your-site>/?to=Sharma%20Family
    https://<your-site>/#for-Sharma-Family
  The gate will greet them by name.
  ───────────────────────────────────────────────────────────────
*/
window.WEDDING = {
  groom: {
    first: "Arjun",
    full: "Arjun Sharma",
    parents: "Son of Mrs. Kavita & Mr. Rajesh Sharma",
  },
  bride: {
    first: "Meera",
    full: "Meera Iyer",
    parents: "Daughter of Mrs. Lakshmi & Mr. Venkatesh Iyer",
  },

  hashtag: "#ArjunKiMeera",

  // Main muhurat (used for the countdown + calendar). Keep the +05:30 for IST.
  weddingDate: "2027-02-12T19:30:00+05:30",
  dateLabel: { day: "12", month: "Feb", year: "2027", weekday: "Friday" },
  city: "Udaipur, Rajasthan",

  invitation: {
    blessing: "With the divine blessings of Shri Ganesh and our elders",
    hosts: "The Sharma & Iyer families",
    lines: [
      "request the honour of your presence",
      "as two hearts, two families and two cultures",
      "come together in the sacred bond of marriage.",
    ],
    closing: "Your blessings will make our celebration complete.",
  },

  // Gallery photos (swipe deck). Add as many as you like.
  photos: {
    hero: "assets/photos/hero.jpg",
    farewell: "assets/photos/farewell.jpg",
    gallery: [
      { src: "assets/photos/1.jpg", caption: "Where it all began" },
      { src: "assets/photos/2.jpg", caption: "The roka" },
      { src: "assets/photos/3.jpg", caption: "Chai, always chai" },
      { src: "assets/photos/4.jpg", caption: "The proposal" },
      { src: "assets/photos/5.jpg", caption: "Two families, one table" },
      { src: "assets/photos/6.jpg", caption: "Forever starts now" },
    ],
  },

  story:
    "A chance meeting at a friend's Diwali party, a debate over the best chaat in town, and countless phone calls later, Arjun and Meera knew. Now our families come together to celebrate the beginning of their forever.",

  // Festivities. theme: haldi | mehendi | sangeet | wedding | reception
  events: [
    {
      theme: "haldi",
      name: "Haldi",
      local: "हल्दी",
      date: "Wednesday, 10 Feb 2027",
      time: "10:00 AM onwards",
      start: "2027-02-10T10:00:00+05:30",
      end: "2027-02-10T13:00:00+05:30",
      venue: "Poolside Lawns, The Leela Palace",
      dress: "Shades of yellow",
      palette: ["#F7D046", "#F2A93B", "#FFF3C4"],
      note: "Wear clothes you don't mind getting a little yellow!",
    },
    {
      theme: "mehendi",
      name: "Mehendi",
      local: "मेहंदी",
      date: "Wednesday, 10 Feb 2027",
      time: "4:00 PM onwards",
      start: "2027-02-10T16:00:00+05:30",
      end: "2027-02-10T20:00:00+05:30",
      venue: "Garden Courtyard, The Leela Palace",
      dress: "Greens & florals",
      palette: ["#5E7D2F", "#A3B86C", "#F2C6D0"],
      note: "Henna artists, folk music and chaat counters.",
    },
    {
      theme: "sangeet",
      name: "Sangeet",
      local: "संगीत",
      date: "Thursday, 11 Feb 2027",
      time: "7:30 PM onwards",
      start: "2027-02-11T19:30:00+05:30",
      end: "2027-02-11T23:30:00+05:30",
      venue: "Grand Ballroom, The Leela Palace",
      dress: "Glam jewel tones",
      palette: ["#8E2A6B", "#3D2C7A", "#D4A84A"],
      note: "Bring your best dance moves. Family performances await.",
    },
    {
      theme: "wedding",
      name: "Shubh Vivah",
      local: "शुभ विवाह",
      date: "Friday, 12 Feb 2027",
      time: "Baraat 5:30 PM · Pheras 7:30 PM",
      start: "2027-02-12T17:30:00+05:30",
      end: "2027-02-12T23:00:00+05:30",
      venue: "Lakeside Mandap, The Leela Palace",
      dress: "Traditional reds & golds",
      palette: ["#A4161A", "#C9A04A", "#F4E7CF"],
      note: "Join the baraat at the main gate at 5:30 PM sharp.",
    },
    {
      theme: "reception",
      name: "Reception",
      local: "स्वागत समारोह",
      date: "Saturday, 13 Feb 2027",
      time: "8:00 PM onwards",
      start: "2027-02-13T20:00:00+05:30",
      end: "2027-02-13T23:59:00+05:30",
      venue: "Durbar Hall, The Leela Palace",
      dress: "Indo-western evening",
      palette: ["#1F2A4A", "#C9A04A", "#E9D8C4"],
      note: "Dinner, music and a toast to the newlyweds.",
    },
  ],

  venue: {
    name: "The Leela Palace",
    area: "Lake Pichola, Udaipur",
    address: "Lake Pichola, Udaipur, Rajasthan 313001",
    mapsUrl: "https://maps.google.com/?q=The+Leela+Palace+Udaipur",
    photo: "assets/photos/venue.jpg",
  },

  stay: [
    {
      title: "Stay",
      text: "Rooms are reserved for all outstation guests at The Leela Palace from 9 to 14 Feb. Just share your arrival details with us.",
    },
    {
      title: "Getting there",
      text: "Maharana Pratap Airport (UDR) is 40 minutes away and Udaipur City station is 20 minutes away. Cars will pick you up on arrival.",
    },
    {
      title: "Weather",
      text: "February in Udaipur is pleasant: around 25°C by day and 10°C at night. Carry a shawl for the evenings by the lake.",
    },
  ],

  contacts: [
    { name: "Rohan Sharma", role: "Groom's brother", phone: "+91 98765 43210" },
    { name: "Priya Iyer", role: "Bride's sister", phone: "+91 98765 12345" },
  ],

  rsvp: {
    // WhatsApp number in international format, digits only (91 = India).
    whatsapp: "919876543210",
    deadline: "Please reply by 15 January 2027",
  },

  // Optional background music. Put an mp3 at this path.
  // If the file is missing, a soft tanpura drone plays instead.
  music: "assets/music.mp3",
};
