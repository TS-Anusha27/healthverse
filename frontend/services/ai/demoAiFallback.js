// HealthVerse — Deterministic Demo AI Fallback (Runs when live LLM API is unavailable or in offline demo mode)

const SPECIALTY_RULES = [
  { keywords: ['cardio', 'heart', 'palpitation', 'chest pressure', 'chest tightness'], specialty: 'Cardiology' },
  { keywords: ['derma', 'skin', 'rash', 'acne', 'eczema', 'itch'], specialty: 'Dermatology' },
  { keywords: ['neuro', 'migraine', 'seizure', 'numbness', 'tingling', 'nerve'], specialty: 'Neurology' },
  { keywords: ['pediat', 'child', 'kid', 'baby', 'infant'], specialty: 'Pediatrics' },
  { keywords: ['ortho', 'bone', 'joint', 'knee', 'fracture', 'back pain', 'sprain'], specialty: 'Orthopedics' },
  { keywords: ['ent', 'ear', 'throat', 'sinus', 'tonsil', 'hearing'], specialty: 'ENT' },
  { keywords: ['onco', 'tumor', 'biopsy', 'chemo'], specialty: 'Oncology' }
];

function detectSpecialty(textLower) {
  for (const rule of SPECIALTY_RULES) {
    if (rule.keywords.some((kw) => textLower.includes(kw))) {
      return rule.specialty;
    }
  }
  return 'General Physician';
}

function detectPreferredDate(textLower) {
  if (/\btomorrow\b/.test(textLower)) return 'Tomorrow';
  if (/\btoday\b/.test(textLower)) return 'Today';
  const isoMatch = textLower.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return isoMatch ? isoMatch[1] : '';
}

function summarizeBookingReason(rawText, specialty) {
  const cleaned = String(rawText || '')
    .replace(/\b(please|help me|can you|i want to|i need to|book|schedule|find|see|an?|the|appointment|doctor|for|tomorrow|today)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.,!?;:-]+|[\s.,!?;:-]+$/g, '')
    .trim();
  if (!cleaned || cleaned.length < 4 || cleaned.toLowerCase() === specialty.toLowerCase()) {
    return `${specialty} consultation`;
  }
  return cleaned.slice(0, 90);
}

/**
 * Generate a safe, contextual response and optional booking intent for #ai-assistant
 * when the backend LLM endpoint is unconfigured or unreachable in Demo Mode.
 */
export function getDemoAssistantReply(messages = []) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const lastUser = [...safeMessages].reverse().find((m) => m?.role === 'user');
  const rawText = String(lastUser?.content || '').trim();
  const q = rawText.toLowerCase();

  const previousAssistant = [...safeMessages]
    .reverse()
    .find((m) => m?.role === 'assistant')?.content || '';

  const demoDisclaimer =
    'Demo AI guidance — informational support only, not a medical diagnosis or prescription. Call 108 / 112 in an emergency.';

  // 1. Booking / Specialist Consultation Request -> Trigger human-in-the-loop Confirmation Card
  const isComparativeQuestion =
    /\b(how do i choose|difference between|which specialist|compare|when should i see a doctor)\b/.test(q);
  const asksToBook =
    !isComparativeQuestion &&
    (/\b(book|schedule|reserve|make an appointment|book an? appointment|set up a visit)\b/.test(q) ||
      /\b(i want to see|i need to see|need a .*appointment|find me a)\b/.test(q) ||
      (/\b(cardiologist|dermatologist|neurologist|pediatrician|orthopedist|orthopedic|ent|physician|doctor)\b/.test(q) &&
        /\b(tomorrow|today|help me book|slot|checkup appointment)\b/.test(q)));

  if (asksToBook) {
    const specialty = detectSpecialty(q);
    const preferredDate = detectPreferredDate(q);
    const reason = summarizeBookingReason(rawText, specialty);
    const urgentPrefix =
      /\b(chest|heart|tightness|breathing|faint)\b/.test(q)
        ? 'If you have severe chest pain, sweating, or shortness of breath right now, please call 108 / 112 or use Emergency SOS immediately.\n\n'
        : '';

    return {
      reply:
        `${urgentPrefix}I have prepared a ${specialty} appointment filter${preferredDate ? ` for ${preferredDate}` : ''}. Please review and click "Confirm & Open Appointments" below — nothing is booked until you choose a hospital and slot.`,
      intent: {
        action: 'book_appointment',
        specialty,
        preferredDate,
        reason
      },
      disclaimer: demoDisclaimer
    };
  }

  // 2. Urgent / Emergency Symptoms
  if (
    !isComparativeQuestion &&
    /\b(chest pain|heart attack|can'?t breathe|difficulty breathing|shortness of breath|severe bleeding|unconscious|fainting|stroke|seizure|choking|overdose|suicid)\b/.test(
      q
    )
  ) {
    return {
      reply:
        'These sound like potential emergency warning signs. Please call 108 or 112 immediately, or tap the red SOS button in HealthVerse right now so an ambulance can be dispatched. Do not drive yourself if symptoms are worsening.',
      intent: null,
      disclaimer: demoDisclaimer
    };
  }

  // 3. Fever / Viral Symptoms / Cold / Cough
  if (/\b(fevers?|temperature|chills|flu|colds?|coughs?|sore throat|fatigue|fatigued|body aches?)\b/.test(q)) {
    return {
      reply:
        'For a mild fever and fatigue:\n• Rest and sip fluids regularly (water, clear broths, or oral rehydration solution).\n• Check and note your temperature every 4–6 hours.\n• Seek a doctor promptly if fever reaches above 103°F (39.4°C), lasts more than 3 days, or is accompanied by breathing trouble, confusion, stiff neck, or chest pain.\n\nYou can also run the 6-step AI Triage on Home or ask me to "Book a General Physician tomorrow".',
      intent: null,
      disclaimer: demoDisclaimer
    };
  }

  // 4. Medicine Safety / Prescriptions
  if (
    /\b(medicine|medicines|medication|pill|tablet|prescription|side effect|dosage|dose|metformin|amoxicillin|telmisartan|ibuprofen|allergy)\b/.test(
      q
    )
  ) {
    let drugNote = '';
    if (q.includes('metformin')) {
      drugNote = '\n• Metformin note: Usually taken with or after meals to reduce mild stomach upset; report severe weakness or persistent nausea to your doctor.';
    } else if (q.includes('amoxicillin')) {
      drugNote = '\n• Amoxicillin note: Penicillin-class antibiotic — verify you have no penicillin allergy and complete the full prescribed course.';
    } else if (q.includes('telmisartan')) {
      drugNote = '\n• Telmisartan note: Blood pressure medicine — monitor blood pressure regularly and tell your doctor if you notice dizziness when standing.';
    } else if (q.includes('ibuprofen')) {
      drugNote = '\n• Ibuprofen note: Take after food if stomach-sensitive and verify kidney/stomach safety with your doctor.';
    }

    return {
      reply:
        `Key medication safety checks to confirm with your prescription label or pharmacist:\n• Timing & Food: Check whether to take it before meals, after food, or at bedtime.\n• Allergies & Interactions: Confirm no penicillin/sulfa allergies or overlapping painkillers.\n• Warning Signs: Seek prompt medical advice for rash, swelling, dizziness, or breathing difficulty.${drugNote}\n\nTip: Open Medicine Reminders and tap "Explain in simple words" for English, Tamil, or Hindi explanations.`,
      intent: null,
      disclaimer: demoDisclaimer
    };
  }

  // 5. Finding / Choosing a Specialist Doctor
  if (/\b(find a doctor|which specialist|specialist|skin|chest discomfort|cardiologist|dermatologist)\b/.test(q)) {
    return {
      reply:
        'Here is a quick guide to picking the right specialist in HealthVerse:\n• Chest discomfort / heart rhythm symptoms → Call 108/112 immediately if severe or sudden; otherwise consult Cardiology.\n• Routine skin rashes, acne, or itching → Consult Dermatology.\n• Joint, bone, or knee pain → Consult Orthopedics.\n• Children’s health → Pediatrics · Migraines/dizziness → Neurology · General fever/checkups → General Physician.\n\nWant me to prepare your appointment search? Try typing "Book a Cardiologist tomorrow" or "Book a Dermatologist".',
      intent: null,
      disclaimer: demoDisclaimer
    };
  }

  // 6. Headache / Stomach / BP / Sugar / General Wellness
  if (/\b(headaches?|migraines?|dizzy|dizziness)\b/.test(q)) {
    return {
      reply:
        'For mild headaches, resting in a quiet dark room, drinking water, and avoiding eye strain can help. Seek urgent medical care right away if a headache is sudden and severe ("worst headache"), follows a head injury, or comes with fever, blurred vision, confusion, or neck stiffness.',
      intent: null,
      disclaimer: demoDisclaimer
    };
  }

  if (/\b(stomach|abdomen|nausea|vomit|acidity|gastric|diarrhea)\b/.test(q)) {
    return {
      reply:
        'For mild stomach upset or acidity, take small sips of water or ORS, eat bland light meals, and avoid spicy or oily foods. Contact a doctor promptly if pain is severe or concentrated on one side, vomiting prevents keeping fluids down, or you see blood or black stools.',
      intent: null,
      disclaimer: demoDisclaimer
    };
  }

  if (/\b(blood pressure|bp|hypertension|sugar|diabetes|glucose|vitals|heart rate)\b/.test(q)) {
    return {
      reply:
        'Tracking vitals consistently at the same time of day gives your doctor the clearest trend. You can view your Blood Pressure & Sugar trends inside Health Insights (#health-insights), and keep taking prescribed maintenance medicines only as directed by your physician.',
      intent: null,
      disclaimer: demoDisclaimer
    };
  }

  // 7. Follow-up & Conversational Basics
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(q)) {
    return {
      reply:
        'Hello! I am HealthVerse AI. I can help answer general symptom questions, share medication safety tips, explain which specialist fits your concern, or prepare an appointment search (try "Book a cardiologist tomorrow"). What can I help you with?',
      intent: null,
      disclaimer: demoDisclaimer
    };
  }

  if (/\b(thank|thanks|ok|okay|got it|cool)\b/.test(q)) {
    return {
      reply:
        'You are welcome! Remember you can tap AI Triage anytime to check symptom urgency, Book to choose a hospital slot, or Ask AI again whenever you have another question.',
      intent: null,
      disclaimer: demoDisclaimer
    };
  }

  if (/^(yes|yeah|sure|more|details|what next|next step)\b/.test(q) && previousAssistant) {
    return {
      reply:
        'As a helpful next step in HealthVerse, you can:\n1. Open AI Triage (#triage) to score your symptom urgency step-by-step.\n2. Ask me to prepare an appointment (for example: "Book a General Physician tomorrow").\n3. Open Emergency SOS (#sos) immediately if symptoms ever feel severe.',
      intent: null,
      disclaimer: demoDisclaimer
    };
  }

  // 8. Safe Catch-All Response (Never returns an error)
  return {
    reply:
      'Thank you for sharing. Keep track of when symptoms started, how severe they feel, and any current medicines or allergies. If symptoms worsen or you notice warning signs like chest pain, trouble breathing, high fever, or fainting, seek urgent medical care or call 108 / 112.\n\nWant help finding a doctor? Tell me what specialist or symptom you would like to book for (e.g., "Book a General Physician tomorrow").',
    intent: null,
    disclaimer: demoDisclaimer
  };
}

const DEMO_EXPLAIN_FALLBACK = {
  English: {
    whatItDoes: 'This prescribed medication is used as part of your doctor’s treatment plan to manage your symptoms or ongoing condition.',
    howUsuallyTaken: 'Follow the exact timing, food instruction, and dosage written on your doctor’s prescription or pharmacy label.',
    thingsToWatch: [
      'Check if this medicine should be taken after food to avoid mild stomach upset.',
      'Watch for unusual dizziness, rash, or allergy symptoms when starting a new dose.'
    ],
    askDoctorIf: [
      'You notice itching, hives, swelling, or trouble breathing.',
      'Your symptoms worsen or you miss multiple scheduled doses.'
    ],
    disclaimer: 'Demo mode plain-language summary — always follow your doctor’s prescription label.'
  },
  Tamil: {
    whatItDoes: 'இந்த மருந்து உங்கள் மருத்துவரின் சிகிச்சைத் திட்டத்தின்படி அறிகுறிகள் அல்லது உடல்நிலையை சீராக பராமரிக்க உதவுகிறது.',
    howUsuallyTaken: 'உங்கள் மருத்துவர் சீட்டு அல்லது மருந்தக லேபிளில் உள்ள நேரத்தையும் அளவையும் தவறாமல் பின்பற்றவும்.',
    thingsToWatch: [
      'வயிற்று எரிச்சலைத் தவிர்க்க உணவுக்குப் பிறகு எடுக்க வேண்டுமா என்பதைக் கவனிக்கவும்.',
      'புதிய மருந்தை தொடங்கும்போது தலைச்சுற்றல் அல்லது தோல் தடிப்பு உள்ளதா என கவனிக்கவும்.'
    ],
    askDoctorIf: [
      'அரிப்பு, வீக்கம் அல்லது மூச்சு விடுவதில் சிரமம் ஏற்பட்டால் உடனே மருத்துவரை அணுகவும்.',
      'அறிகுறிகள் அதிகரித்தால் அல்லது தொடர்ந்து மருந்து தவறினால் மருத்துவரிடம் கேட்கவும்.'
    ],
    disclaimer: 'டெமோ எளிய விளக்கம் — உங்கள் மருத்துவரின் அறிவுரையையே எப்போதும் பின்பற்றவும்.'
  },
  Hindi: {
    whatItDoes: 'यह दवा आपके डॉक्टर की सलाह के अनुसार आपके लक्षणों या स्वास्थ्य स्थिति को नियंत्रित करने में मदद करती है।',
    howUsuallyTaken: 'दवा हमेशा अपने डॉक्टर के पर्चे या फार्मेसी लेबल पर लिखे सही समय और निर्देश के अनुसार ही लें।',
    thingsToWatch: [
      'पेट में हल्की जलन से बचने के लिए जांचें कि दवा भोजन के बाद लेनी है या नहीं।',
      'नई दवा शुरू करते समय चक्कर, एलर्जी या त्वचा पर दाने पर ध्यान दें।'
    ],
    askDoctorIf: [
      'खुजली, सूजन या सांस लेने में तकलीफ हो तो तुरंत डॉक्टर से संपर्क करें।',
      'लक्षण बढ़ जाएं या कई खुराक छूट जाएं तो डॉक्टर से सलाह लें।'
    ],
    disclaimer: 'डेमो सरल जानकारी — हमेशा अपने डॉक्टर और पर्चे के निर्देशों का पालन करें।'
  }
};

/**
 * Fallback multilingual explanation for "Explain in simple words" in Demo Mode.
 */
export function getDemoPlainExplanation({ item = '', language = 'English' } = {}) {
  const lang = DEMO_EXPLAIN_FALLBACK[language] ? language : 'English';
  const base = { ...DEMO_EXPLAIN_FALLBACK[lang], language: lang };
  const lower = String(item || '').toLowerCase();

  if (lang === 'English') {
    if (lower.includes('metformin')) {
      base.whatItDoes = 'Metformin helps lower and stabilize blood sugar levels, commonly used for Type 2 diabetes.';
    } else if (lower.includes('telmisartan')) {
      base.whatItDoes = 'Telmisartan relaxes blood vessels to help keep blood pressure in a healthy range.';
    } else if (lower.includes('amoxicillin')) {
      base.whatItDoes = 'Amoxicillin is a penicillin-type antibiotic prescribed to clear bacterial infections.';
    } else if (lower.includes('ibuprofen')) {
      base.whatItDoes = 'Ibuprofen is an anti-inflammatory medicine used for short-term pain relief or fever reduction.';
    }
  }
  return base;
}
