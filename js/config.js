/*
  ───────────────────────────────────────────────────────────────
  WEDDING DETAILS — edit this file only.
  Text is written as { hi: "हिंदी", en: "English" }. The site opens
  in English; guests can switch to Hindi with the button at the top.
  Add ?lang=hi to a link to open it in Hindi.

  Photos: put images in  assets/photos/  (see the README there).
  Missing photos show an ornamental placeholder.

  Personal links for relatives (the doors greet them by name):
    https://<your-site>/?to=Sharma%20Family
    https://<your-site>/?to=शर्मा%20परिवार&lang=hi
  ───────────────────────────────────────────────────────────────
*/
window.WEDDING = {
  monogram: ["M", "S"],

  groom: {
    title: { hi: "आयुष्मान्", en: "Chi." },
    name: { hi: "मोहित", en: "Mohit" },
    parents: [
      { hi: "(सुपुत्र श्रीमती ऊषा एवं राजेश खण्डेलवाल)", en: "Son of Smt. Usha & Shri Rajesh Khandelwal" },
    ],
  },
  bride: {
    title: { hi: "आयुष्मति", en: "Sau." },
    name: { hi: "सोनल", en: "Sonal" },
    parents: [
      { hi: "(सुपौत्री श्रीमती मिथलेश देवी एवं श्री भगवानदास जी गुप्ता)", en: "Granddaughter of Smt. Mithlesh Devi & Shri Bhagwandas Ji Gupta" },
      { hi: "(सुपुत्री श्रीमती मीनाक्षी देवी एवं श्री सुनील जी गुप्ता)", en: "Daughter of Smt. Meenakshi Devi & Shri Sunil Ji Gupta" },
    ],
  },

  hashtag: "#MohitWedsSonal",

  // Countdown target: baraat departure
  weddingDate: "2026-11-20T17:30:00+05:30",
  dateLabel: {
    day: "20",
    month: { hi: "नवम्बर", en: "Nov" },
    monthLong: { hi: "नवम्बर", en: "November" },
    year: "2026",
    weekday: { hi: "शुक्रवार", en: "Friday" },
  },
  city: { hi: "जयपुर", en: "Jaipur" },

  shloka: {
    hi: ["ॐ वक्रतुण्ड महाकाय, सूर्य कोटि समप्रभः।", "निर्विघ्नं कुरुमे देव, सर्व कार्येषु सर्वदा॥"],
  },

  invitation: {
    doha: ["विघ्न हरण मंगल करण, गणनायक गणराज।", "प्रथम निमंत्रण आपको, सकल सुधारो काज॥"],
    blessing: { hi: "श्री राधागोविन्द जी महाराज की असीम अनुकम्पा से", en: "With the infinite grace of Shri Radha Govind Ji Maharaj" },
    hosts: { hi: "श्रीमती मालती देवी एवं धर्मपत्नी स्व. श्री रामप्रसाद जी खण्डेलवाल", en: "Smt. Malti Devi, wife of Late Shri Ramprasad Ji Khandelwal" },
    relation: { hi: "अपने सुपौत्र", en: "joyfully invites you to the wedding of her grandson" },
    occasion: { hi: "के मंगल परिणयोत्सव की मधुर बेला पर आपको सस्नेह सादर आमंत्रित करते हैं।", en: "Your gracious presence will make this auspicious occasion complete." },
    closing: { hi: "कृपया पधारकर वर-वधु को आशीर्वाद प्रदान कर हमें अनुगृहीत करें।", en: "Kindly join us and bless the couple." },
  },

  photos: {
    hero: "assets/photos/hero.jpg",
    farewell: "assets/photos/farewell.jpg",
    gallery: [
      { src: "assets/photos/1.jpg", caption: { hi: "मोहित ♥ सोनल", en: "Mohit ♥ Sonal" } },
      { src: "assets/photos/2.jpg", caption: { hi: "साथ का सफ़र", en: "Together" } },
      { src: "assets/photos/3.jpg", caption: { hi: "मुस्कुराहटें", en: "All smiles" } },
      { src: "assets/photos/4.jpg", caption: { hi: "दो परिवार, एक रिश्ता", en: "Two families, one bond" } },
      { src: "assets/photos/5.jpg", caption: { hi: "सदा के लिए", en: "Forever" } },
    ],
  },

  // Venue for all ceremonies (from the card)
  venue: {
    name: { hi: "‘राजकमल पैलेस’", en: "Rajkamal Palace" },
    address: { hi: "रजत पथ, मांग्यावास रोड, मानसरोवर (जयपुर) - 302020", en: "Rajat Path, Mangyawas Road, Mansarovar, Jaipur - 302020" },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rajkamal+Palace+Rajat+Path+Mangyawas+Road+Mansarovar+Jaipur",
    photo: "assets/photos/venue.jpg",
  },
  baraat: {
    note: {
      hi: "बारात 20 नवम्बर, 2026 को सायं 5:30 बजे शिव मन्दिर होटल न्यू हवेली से सजकर विवाह स्थल के लिए प्रस्थान करेगी।",
      en: "The baraat will set off on 20 November 2026 at 5:30 PM from Shiv Mandir Hotel New Haveli to the venue.",
    },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+New+Haveli+Shiv+Mandir+Mansarovar+Jaipur",
  },

  // Day-wise programme. icon: ganesh | kalash | haldi | tilak | sangeet | bhoj | bhat | chaak | nikasi | baraat | phere
  days: [
    {
      date: "2026-11-16",
      wd: { hi: "सोम", en: "Mon" },
      label: { hi: "सोमवार, 16 नवम्बर 2026", en: "Monday, 16 November 2026" },
      events: [
        { icon: "ganesh", name: { hi: "गणेश पूजन", en: "Ganesh Pujan" }, time: { hi: "प्रातः 5:00 बजे", en: "5:00 AM" }, start: "2026-11-16T05:00:00+05:30",
          about: { hi: "श्री गणेश जी के आह्वान के साथ मांगलिक कार्यों का शुभारंभ", en: "Invoking Shri Ganesh to begin the auspicious ceremonies" } },
      ],
    },
    {
      date: "2026-11-18",
      wd: { hi: "बुध", en: "Wed" },
      label: { hi: "बुधवार, 18 नवम्बर 2026", en: "Wednesday, 18 November 2026" },
      events: [
        { icon: "kalash", name: { hi: "बान सांकड़ी", en: "Baan Sankdi" }, time: { hi: "प्रातः 11:00 बजे", en: "11:00 AM" }, start: "2026-11-18T11:00:00+05:30",
          about: { hi: "पारंपरिक बान की रस्म", en: "The traditional Baan ritual" } },
      ],
    },
    {
      date: "2026-11-19",
      wd: { hi: "गुरु", en: "Thu" },
      label: { hi: "गुरुवार, 19 नवम्बर 2026", en: "Thursday, 19 November 2026" },
      events: [
        { icon: "haldi", name: { hi: "हल्दी", en: "Haldi" }, time: { hi: "प्रातः 11:00 बजे", en: "11:00 AM" }, start: "2026-11-19T11:00:00+05:30",
          about: { hi: "हल्दी की रस्म: रंग, हँसी और आशीर्वाद", en: "Turmeric ceremony full of colour and blessings" } },
        { icon: "tilak", name: { hi: "लग्न-टीका", en: "Lagan-Tika" }, time: { hi: "सायं 4:00 बजे से", en: "4:00 PM onwards" }, start: "2026-11-19T16:00:00+05:30",
          about: { hi: "लग्न-टीका की शुभ रस्म", en: "The auspicious Lagan-Tika ceremony" } },
        { icon: "sangeet", name: { hi: "संगीत", en: "Sangeet" }, time: { hi: "सायं 7:00 बजे से", en: "7:00 PM onwards" }, start: "2026-11-19T19:00:00+05:30",
          about: { hi: "गीत, संगीत और नृत्य की शाम", en: "An evening of music and dance" } },
        { icon: "bhoj", name: { hi: "प्रीतिभोज", en: "Dinner" }, time: { hi: "सायं 7:30 बजे से", en: "7:30 PM onwards" }, start: "2026-11-19T19:30:00+05:30",
          about: { hi: "स्नेह भोज", en: "Dinner with family and friends" } },
      ],
    },
    {
      date: "2026-11-20",
      wd: { hi: "शुक्र", en: "Fri" },
      label: { hi: "शुक्रवार, 20 नवम्बर 2026", en: "Friday, 20 November 2026" },
      main: true,
      events: [
        { icon: "bhat", name: { hi: "भात", en: "Bhaat" }, time: { hi: "प्रातः 10:00 बजे", en: "10:00 AM" }, start: "2026-11-20T10:00:00+05:30",
          about: { hi: "ननिहाल पक्ष द्वारा भात (मायरा) की रस्म", en: "Bhaat (Mayra) by the maternal family" } },
        { icon: "chaak", name: { hi: "चाक", en: "Chaak Pujan" }, time: { hi: "दोपहर 2:00 बजे", en: "2:00 PM" }, start: "2026-11-20T14:00:00+05:30",
          about: { hi: "चाक पूजन की पारंपरिक रस्म", en: "Traditional worship of the potter's wheel" } },
        { icon: "nikasi", name: { hi: "निकासी", en: "Nikasi" }, time: { hi: "सायं 4:00 बजे", en: "4:00 PM" }, start: "2026-11-20T16:00:00+05:30",
          about: { hi: "दूल्हे की निकासी", en: "The groom's ceremonial departure" } },
        { icon: "baraat", name: { hi: "बारात प्रस्थान", en: "Baraat" }, time: { hi: "सायं 5:30 बजे", en: "5:30 PM" }, start: "2026-11-20T17:30:00+05:30",
          about: { hi: "शिव मन्दिर होटल न्यू हवेली से विवाह स्थल के लिए", en: "From Shiv Mandir Hotel New Haveli to the venue" }, map: "baraat" },
        { icon: "bhoj", name: { hi: "प्रीतिभोज", en: "Dinner" }, time: { hi: "सायं 7:15 बजे", en: "7:15 PM" }, start: "2026-11-20T19:15:00+05:30",
          about: { hi: "स्नेह भोज", en: "Wedding dinner" } },
        { icon: "phere", name: { hi: "पाणिग्रहण संस्कार", en: "Pheras" }, time: { hi: "शुभ लग्नानुसार", en: "At the auspicious muhurat" },
          about: { hi: "सात फेरों का पवित्र बंधन", en: "The sacred seven vows" }, highlight: true },
      ],
    },
  ],

  // Family listing (names stay as written on the card)
  family: [
    { title: { hi: "विशेष आग्रह", en: "With warm requests" }, names: ["सीताराम ताम्बी", "सुमन - वल्लभ जी", "सीमा - के.के. जी", "शीतल - राहुल जी", "श्रुति, खुशी"] },
    { title: { hi: "उत्तराकांक्षी", en: "Eagerly awaiting you" }, names: ["सुरेश - रानी", "महेश - किरण", "दिनेश - मोनिका"] },
    { title: { hi: "दर्शनाभिलाषी", en: "Hoping to see you" }, names: ["घनश्याम, विमल, मुकेश", "राकेश, राहुल, यश, प्राजल", "दक्ष एवं समस्त घीया परिवार", "(कंचनपुर वाले)"] },
    { title: { hi: "ननिहाल पक्ष", en: "Maternal family" }, names: ["रामरतन जी - सावित्री देवी", "नीरज - रेखा", "रमेश - मीनाक्षी", "अभिषेक - विदीषा", "शुभम् - सौरव", "एवं समस्त बड़गोती परिवार", "(अचरोल वाले)"] },
    { title: { hi: "बाल मनुहार", en: "With love from the little ones" }, names: ["रिद्धी, ख्वाहिश"] },
  ],

  businesses: [
    { name: { hi: "फैशन पैलेस", en: "Fashion Palace" }, place: { hi: "80 फीट रोड, महेश नगर, जयपुर", en: "80 Feet Road, Mahesh Nagar, Jaipur" } },
    { name: { hi: "फैशन फुटवियर", en: "Fashion Footwear" }, place: { hi: "सरावगी मैन्शन, जयपुर", en: "Saraogi Mansion, Jaipur" } },
  ],

  sender: {
    name: { hi: "राजेश खण्डेलवाल", en: "Rajesh Khandelwal" },
    address: { hi: "प्लॉट नं. 327, गली नं. 10, बरकत नगर, टोंक फाटक, जयपुर", en: "Plot No. 327, Gali No. 10, Barkat Nagar, Tonk Phatak, Jaipur" },
    phones: ["+91 93140 23987", "+91 77338 41613"],
  },

  rsvp: {
    // WhatsApp number for replies, digits only with country code
    whatsapp: "919314023987",
  },

  music: "assets/music.mp3",
};
