// HealthVerse — Mock Data
export const mockData = {
  // Hospitals
  hospitals: [
    {
      id: 'h1',
      name: 'Apollo Hospitals',
      specialty: 'Multi-Specialty',
      rating: 4.8,
      reviews: 2841,
      distance: '1.2 km',
      distanceVal: 1.2,
      address: '21, Greams Lane, Chennai',
      phone: '+91 44 2829 3333',
      emergency: true,
      waitTime: '15-20 min',
      queue: 12,
      photo: null,
      lat: 13.0602,
      lng: 80.2496,
      specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Pediatrics'],
      doctors: ['dr1', 'dr2', 'dr3'],
      beds: { total: 350, available: 47 },
      insurance: ['Mediclaim', 'Star Health', 'ICICI Lombard', 'ABHA']
    },
    {
      id: 'h2',
      name: 'Fortis Healthcare',
      specialty: 'Multi-Specialty',
      rating: 4.7,
      reviews: 1923,
      distance: '2.4 km',
      distanceVal: 2.4,
      address: 'Rajaji Salai, Chennai',
      phone: '+91 44 4244 5555',
      emergency: true,
      waitTime: '25-30 min',
      queue: 21,
      photo: null,
      lat: 13.0780,
      lng: 80.2785,
      specialties: ['Cardiology', 'Gastroenterology', 'Pulmonology', 'Nephrology'],
      doctors: ['dr4', 'dr5'],
      beds: { total: 280, available: 32 },
      insurance: ['ABHA', 'HDFC Ergo', 'New India', 'United India']
    },
    {
      id: 'h3',
      name: 'Manipal Hospital',
      specialty: 'Super Specialty',
      rating: 4.6,
      reviews: 3102,
      distance: '3.1 km',
      distanceVal: 3.1,
      address: 'Velachery, Chennai',
      phone: '+91 44 6600 6600',
      emergency: true,
      waitTime: '10-15 min',
      queue: 8,
      photo: null,
      lat: 12.9750,
      lng: 80.2200,
      specialties: ['Neurology', 'Oncology', 'Transplant', 'Pediatrics'],
      doctors: ['dr6', 'dr7'],
      beds: { total: 400, available: 68 },
      insurance: ['All Major Insurance', 'ABHA']
    },
    {
      id: 'h4',
      name: 'MIOT International',
      specialty: 'Orthopedic & Spine',
      rating: 4.9,
      reviews: 1205,
      distance: '4.2 km',
      distanceVal: 4.2,
      address: 'Manapakkam, Chennai',
      phone: '+91 44 4200 2288',
      emergency: false,
      waitTime: '5-10 min',
      queue: 5,
      photo: null,
      lat: 13.0120,
      lng: 80.1630,
      specialties: ['Orthopedics', 'Sports Medicine', 'Spine Surgery'],
      doctors: ['dr8'],
      beds: { total: 120, available: 22 },
      insurance: ['Star Health', 'Mediclaim', 'ABHA']
    }
  ],

  // Doctors
  doctors: [
    {
      id: 'dr1',
      name: 'Dr. Priya Krishnamurthy',
      specialty: 'Cardiologist',
      qualification: 'MD, DM (Cardiology) — AIIMS Delhi',
      hospital: 'Apollo Hospitals',
      hospitalId: 'h1',
      experience: 14,
      rating: 4.9,
      reviews: 892,
      fee: 800,
      available: true,
      nextSlot: 'Today, 3:30 PM',
      photo: null,
      languages: ['English', 'Tamil', 'Hindi'],
      about: 'Dr. Priya is a leading interventional cardiologist specializing in complex coronary artery disease and structural heart conditions.'
    },
    {
      id: 'dr2',
      name: 'Dr. Arjun Mehta',
      specialty: 'Neurologist',
      qualification: 'MD, DM (Neurology) — CMC Vellore',
      hospital: 'Apollo Hospitals',
      hospitalId: 'h1',
      experience: 11,
      rating: 4.8,
      reviews: 654,
      fee: 900,
      available: true,
      nextSlot: 'Today, 5:00 PM',
      photo: null,
      languages: ['English', 'Hindi', 'Tamil'],
      about: 'Specializes in epilepsy, movement disorders, and neurodegenerative diseases with over 3000 successful procedures.'
    },
    {
      id: 'dr3',
      name: 'Dr. Kavitha Rajan',
      specialty: 'Pediatrician',
      qualification: 'MD (Pediatrics) — Madras Medical College',
      hospital: 'Apollo Hospitals',
      hospitalId: 'h1',
      experience: 9,
      rating: 4.7,
      reviews: 1120,
      fee: 600,
      available: false,
      nextSlot: 'Tomorrow, 10:00 AM',
      photo: null,
      languages: ['English', 'Tamil'],
      about: 'Caring pediatrician with expertise in neonatology and childhood developmental disorders.'
    },
    {
      id: 'dr4',
      name: 'Dr. Rajesh Nair',
      specialty: 'Gastroenterologist',
      qualification: 'MD, DM (Gastroenterology) — JIPMER',
      hospital: 'Fortis Healthcare',
      hospitalId: 'h2',
      experience: 16,
      rating: 4.9,
      reviews: 723,
      fee: 1000,
      available: true,
      nextSlot: 'Today, 4:15 PM',
      photo: null,
      languages: ['English', 'Malayalam', 'Tamil'],
      about: 'Expert in advanced endoscopy and hepatology with specialized training from Massachusetts General Hospital.'
    },
    {
      id: 'dr5',
      name: 'Dr. Sunita Sharma',
      specialty: 'Pulmonologist',
      qualification: 'MD (Pulmonology) — PGIMER Chandigarh',
      hospital: 'Fortis Healthcare',
      hospitalId: 'h2',
      experience: 12,
      rating: 4.7,
      reviews: 445,
      fee: 750,
      available: true,
      nextSlot: 'Today, 6:00 PM',
      photo: null,
      languages: ['English', 'Hindi', 'Punjabi'],
      about: 'Specializes in asthma, COPD, sleep disorders and interventional pulmonology.'
    }
  ],

  // Blood Banks
  bloodBanks: [
    { id: 'bb1', name: 'Rotary Blood Bank', address: 'Anna Nagar, Chennai', phone: '+91 44 2628 3344', distance: '0.8 km', stock: { 'A+': 12, 'A-': 3, 'B+': 8, 'B-': 2, 'O+': 15, 'O-': 5, 'AB+': 4, 'AB-': 1 }, open24h: true },
    { id: 'bb2', name: 'Government General Hospital Blood Bank', address: 'Park Town, Chennai', phone: '+91 44 2530 5000', distance: '2.1 km', stock: { 'A+': 20, 'A-': 5, 'B+': 18, 'B-': 3, 'O+': 25, 'O-': 8, 'AB+': 7, 'AB-': 2 }, open24h: true },
  ],

  // Time slots
  timeSlots: [
    { id: 's1', time: '9:00 AM', available: false },
    { id: 's2', time: '9:30 AM', available: false },
    { id: 's3', time: '10:00 AM', available: true },
    { id: 's4', time: '10:30 AM', available: true },
    { id: 's5', time: '11:00 AM', available: false },
    { id: 's6', time: '11:30 AM', available: true },
    { id: 's7', time: '2:00 PM', available: true },
    { id: 's8', time: '2:30 PM', available: false },
    { id: 's9', time: '3:00 PM', available: true },
    { id: 's10', time: '3:30 PM', available: true },
    { id: 's11', time: '4:00 PM', available: false },
    { id: 's12', time: '4:30 PM', available: true },
    { id: 's13', time: '5:00 PM', available: true },
    { id: 's14', time: '5:30 PM', available: true },
  ],

  // Patient appointments
  appointments: [
    {
      id: 'a1',
      doctorId: 'dr1',
      doctorName: 'Dr. Priya Krishnamurthy',
      specialty: 'Cardiologist',
      hospital: 'Apollo Hospitals',
      date: 'Today',
      time: '3:30 PM',
      type: 'In-Person',
      token: 'TK-047',
      status: 'confirmed',
      qrCode: 'QR-A1-HEALTHVERSE',
      room: 'Room 204, 2nd Floor'
    }
  ],

  // Health records
  healthRecords: [
    {
      id: 'r1',
      type: 'Blood Report',
      title: 'Complete Blood Count (CBC)',
      date: '15 Jul 2026',
      hospital: 'Apollo Hospitals',
      doctor: 'Dr. Priya Krishnamurthy',
      status: 'normal',
      icon: 'droplets'
    },
    {
      id: 'r2',
      type: 'Prescription',
      title: 'Cardiology Follow-up Prescription',
      date: '15 Jul 2026',
      hospital: 'Apollo Hospitals',
      doctor: 'Dr. Priya Krishnamurthy',
      status: 'active',
      icon: 'file-text'
    },
    {
      id: 'r3',
      type: 'ECG Report',
      title: 'Resting Electrocardiogram',
      date: '10 Jul 2026',
      hospital: 'Fortis Healthcare',
      doctor: 'Dr. Rajesh Nair',
      status: 'normal',
      icon: 'activity'
    },
    {
      id: 'r4',
      type: 'Vaccination',
      title: 'COVID-19 Booster (Dose 3)',
      date: '1 Jun 2026',
      hospital: 'Government Health Centre',
      doctor: 'Community Health',
      status: 'completed',
      icon: 'shield'
    },
    {
      id: 'r5',
      type: 'X-Ray',
      title: 'Chest X-Ray — PA View',
      date: '20 May 2026',
      hospital: 'MIOT International',
      doctor: 'Dr. Rajesh Nair',
      status: 'normal',
      icon: 'scan'
    },
    {
      id: 'r6',
      type: 'MRI Scan',
      title: 'Brain MRI — Routine Screening',
      date: '5 Apr 2026',
      hospital: 'Manipal Hospital',
      doctor: 'Dr. Arjun Mehta',
      status: 'normal',
      icon: 'brain'
    }
  ],

  // Medicines
  medicines: [
    {
      id: 'm1',
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Once daily',
      time: '8:00 AM',
      meals: 'Before meals',
      refillDays: 12,
      taken: true,
      color: '#4A90D9'
    },
    {
      id: 'm2',
      name: 'Metoprolol Succinate',
      dosage: '25mg',
      frequency: 'Twice daily',
      time: '8:00 AM, 8:00 PM',
      meals: 'After meals',
      refillDays: 12,
      taken: true,
      color: '#52C99B'
    },
    {
      id: 'm3',
      name: 'Rosuvastatin',
      dosage: '10mg',
      frequency: 'Once at night',
      time: '10:00 PM',
      meals: 'After meals',
      refillDays: 12,
      taken: false,
      color: '#7B68EE'
    },
    {
      id: 'm4',
      name: 'Aspirin',
      dosage: '75mg',
      frequency: 'Once daily',
      time: '9:00 AM',
      meals: 'After breakfast',
      refillDays: 5,
      taken: false,
      color: '#FFA502'
    }
  ],

  // Blood donors
  bloodDonors: [
    { id: 'bd1', name: 'Arun Kumar', group: 'O+', distance: '0.5 km', lastDonated: '3 months ago', phone: '+91 9876543210', eligible: true },
    { id: 'bd2', name: 'Sneha Patel', group: 'AB-', distance: '1.2 km', lastDonated: '6 months ago', phone: '+91 9876543211', eligible: true },
    { id: 'bd3', name: 'Vikram Singh', group: 'B+', distance: '2.0 km', lastDonated: '4 months ago', phone: '+91 9876543212', eligible: true },
  ],

  // Ambulance drivers
  ambulanceDrivers: [
    { id: 'amb1', name: 'Ravi Kumar', vehicle: 'MH 01 AX 4892', distance: '0.8 km', eta: '4 min', rating: 4.8, status: 'available' },
    { id: 'amb2', name: 'Suresh Babu', vehicle: 'TN 07 BX 3341', distance: '1.5 km', eta: '7 min', rating: 4.9, status: 'available' },
  ],

  // Health vitals (for charts)
  vitals: {
    heartRate: [72, 75, 71, 74, 78, 73, 76, 74, 72, 75, 73, 77, 74, 72, 75],
    bloodPressure: {
      systolic: [118, 122, 119, 121, 125, 120, 118, 122, 121, 119, 123, 120, 118, 122, 120],
      diastolic: [76, 79, 77, 78, 82, 78, 76, 79, 78, 77, 80, 78, 77, 79, 78]
    },
    weight: [72.5, 72.3, 72.4, 72.1, 71.9, 72.0, 71.8, 71.7, 71.9, 71.6, 71.5, 71.4, 71.6, 71.3, 71.2],
    bloodSugar: [95, 98, 94, 97, 102, 96, 93, 98, 95, 97, 99, 95, 93, 97, 96],
    labels: ['11 Jul', '12 Jul', '13 Jul', '14 Jul', '15 Jul', '16 Jul', '17 Jul', '18 Jul', '19 Jul', '20 Jul', '21 Jul', '22 Jul', '23 Jul', '24 Jul', '25 Jul']
  },

  // Doctor's patient queue
  doctorQueue: [
    { id: 'q1', token: 'TK-041', name: 'Ramesh Kumar', age: 58, condition: 'Chest Pain', triage: 'orange', wait: '5 min', photo: null },
    { id: 'q2', token: 'TK-042', name: 'Lakshmi Devi', age: 42, condition: 'Follow-up', triage: 'green', wait: '12 min', photo: null },
    { id: 'q3', token: 'TK-043', name: 'Pradeep Sharma', age: 35, condition: 'Hypertension', triage: 'yellow', wait: '18 min', photo: null },
    { id: 'q4', token: 'TK-044', name: 'Anjali Mehta', age: 29, condition: 'Palpitations', triage: 'yellow', wait: '25 min', photo: null },
    { id: 'q5', token: 'TK-045', name: 'Mohit Gupta', age: 65, condition: 'Post-Surgery', triage: 'orange', wait: '32 min', photo: null },
    { id: 'q6', token: 'TK-046', name: 'Sarika Joshi', age: 48, condition: 'Diabetes Complication', triage: 'red', wait: '38 min', photo: null },
    { id: 'q7', token: 'TK-047', name: 'Aarav Patel', age: 28, condition: 'Routine Checkup', triage: 'green', wait: '45 min', photo: null },
  ],

  // Active emergency requests (for ambulance driver)
  emergencyRequests: [
    {
      id: 'e1',
      patientName: 'Meera Krishnan',
      condition: 'Chest Pain — Urgent',
      address: '45, Anna Nagar, Chennai',
      distance: '1.2 km',
      eta: '4 min',
      hospital: 'Apollo Hospitals',
      triage: 'red',
      lat: 13.0700,
      lng: 80.2100
    }
  ]
};

// Mock AI-generated patient summary
export const mockAISummary = {
  name: 'Aarav Patel',
  age: 28,
  gender: 'Male',
  bloodGroup: 'B+',
  healthScore: 82,
  lastUpdated: '25 Jul 2026',
  conditions: ['Mild Hypertension (Stage 1)', 'Hyperlipidemia'],
  currentMedications: [
    { name: 'Amlodipine 5mg', frequency: 'Once daily', since: 'Jan 2026' },
    { name: 'Metoprolol 25mg', frequency: 'Twice daily', since: 'Jan 2026' },
    { name: 'Rosuvastatin 10mg', frequency: 'Once at night', since: 'Mar 2026' },
    { name: 'Aspirin 75mg', frequency: 'Once daily', since: 'Jan 2026' }
  ],
  allergies: ['Penicillin', 'Sulfa drugs'],
  criticalAlerts: [
    { type: 'allergy', message: 'PENICILLIN ALLERGY — Avoid all beta-lactam antibiotics', severity: 'high' },
    { type: 'interaction', message: 'Monitor renal function with combined NSAID use', severity: 'medium' }
  ],
  pastSurgeries: [],
  riskScores: {
    diabetes: 18,
    cardiovascular: 24,
    hypertension: 65
  },
  recommendations: [
    'Regular blood pressure monitoring (target < 130/80 mmHg)',
    'Low-sodium diet recommended',
    'Aerobic exercise 30 min/day, 5 days/week',
    'Annual lipid profile review',
    'Reduce alcohol consumption'
  ],
  timeline: [
    { date: 'Jul 2026', event: 'CBC Report — Normal', icon: 'droplets', type: 'lab' },
    { date: 'Jul 2026', event: 'Cardiology follow-up — Stable BP 128/82', icon: 'heart', type: 'visit' },
    { date: 'Jun 2026', event: 'COVID Booster administered', icon: 'shield', type: 'vaccine' },
    { date: 'May 2026', event: 'Chest X-Ray — Clear', icon: 'scan', type: 'scan' },
    { date: 'Mar 2026', event: 'Rosuvastatin added — LDL 148 mg/dL', icon: 'pill', type: 'medication' },
    { date: 'Jan 2026', event: 'Hypertension diagnosed — BP 145/92', icon: 'activity', type: 'diagnosis' }
  ]
};

// Triage AI engine
export const triageEngine = {
  questions: [
    { id: 'q1', text: 'Hello! I\'m HealthVerse AI. I\'ll help assess your symptoms. Are you experiencing any chest pain or tightness?', options: ['Yes, severe', 'Yes, mild', 'No'] },
    { id: 'q2', text: 'Are you having difficulty breathing or shortness of breath?', options: ['Yes, severe', 'Yes, mild', 'No'] },
    { id: 'q3', text: 'Do you have a fever? If yes, what is your temperature?', options: ['Yes, above 103°F', 'Yes, 100-103°F', 'No fever'] },
    { id: 'q4', text: 'How long have you been experiencing these symptoms?', options: ['Just started (< 1 hour)', 'A few hours', 'More than a day'] },
    { id: 'q5', text: 'Do you have any of these conditions? Diabetes, Heart Disease, or are you Pregnant?', options: ['Yes (High Risk)', 'No existing conditions'] },
    { id: 'q6', text: 'Are you currently conscious and alert? (Answer for yourself or the patient)', options: ['Fully Alert', 'Confused/Drowsy', 'Unconscious'] }
  ],

  assess(answers) {
    let score = 0;
    if (answers[0] === 'Yes, severe') score += 4;
    if (answers[0] === 'Yes, mild') score += 2;
    if (answers[1] === 'Yes, severe') score += 4;
    if (answers[1] === 'Yes, mild') score += 2;
    if (answers[2] === 'Yes, above 103°F') score += 3;
    if (answers[2] === 'Yes, 100-103°F') score += 1;
    if (answers[3] === 'Just started (< 1 hour)') score += 1;
    if (answers[4] === 'Yes (High Risk)') score += 2;
    if (answers[5] === 'Confused/Drowsy') score += 3;
    if (answers[5] === 'Unconscious') score += 6;

    if (score >= 8) return { level: 'red', label: 'CRITICAL — Immediate Emergency', action: 'Dispatching ambulance now', color: '#E74C3C', icon: 'alert-triangle', message: 'Your symptoms indicate a potentially life-threatening condition. Emergency services are being notified. Please stay calm and do not move.' };
    if (score >= 5) return { level: 'orange', label: 'URGENT — Immediate Consultation', action: 'Book Urgent Appointment', color: '#E67E22', icon: 'alert-circle', message: 'Your symptoms require urgent medical attention within the next few hours. Book an urgent appointment or visit the nearest emergency room.' };
    if (score >= 2) return { level: 'yellow', label: 'MODERATE — Appointment Recommended', action: 'Schedule Appointment', color: '#F39C12', icon: 'clock', message: 'Your symptoms should be evaluated by a doctor. We recommend scheduling an appointment within 24-48 hours.' };
    return { level: 'green', label: 'MILD — Home Care', action: 'View Home Care Tips', color: '#27AE60', icon: 'home', message: 'Your symptoms appear mild. Rest, stay hydrated, and monitor your condition. Consult a doctor if symptoms worsen.' };
  }
};
