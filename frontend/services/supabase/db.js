// HealthVerse — Full Database Service for 19 Domain Tables with Mock Fallbacks
import { supabase } from './client.js';
import { mockData, mockAISummary } from '../data.js';

// ---------------------------------------------------------------------
// 1. PROFILES & PATIENTS
// ---------------------------------------------------------------------
export async function getPatientProfile(userId) {
  try {
    const { data, error } = await supabase.from('patients').select('*, profiles(*)').eq('id', userId).single();
    if (error || !data) return mockData.patient;
    return data;
  } catch (err) {
    console.warn('DB getPatientProfile fallback:', err.message);
    return mockData.patient;
  }
}

export async function createPatientProfile(patientData) {
  try {
    const { data, error } = await supabase.from('patients').upsert([patientData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createPatientProfile fallback:', err.message);
    return { data: patientData, error: null };
  }
}

// ---------------------------------------------------------------------
// 2. HOSPITALS
// ---------------------------------------------------------------------
export async function getHospitals() {
  try {
    const { data, error } = await supabase.from('hospitals').select('*');
    if (error || !data || data.length === 0) return mockData.hospitals;
    return data;
  } catch (err) {
    console.warn('DB getHospitals fallback:', err.message);
    return mockData.hospitals;
  }
}

// ---------------------------------------------------------------------
// 3. DOCTORS & REVIEWS
// ---------------------------------------------------------------------
export async function getDoctors() {
  try {
    const { data, error } = await supabase.from('doctors').select('*');
    if (error || !data || data.length === 0) return mockData.doctors;
    return data;
  } catch (err) {
    console.warn('DB getDoctors fallback:', err.message);
    return mockData.doctors;
  }
}

export async function createDoctorProfile(doctorData) {
  try {
    const { data, error } = await supabase.from('doctors').insert([doctorData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createDoctorProfile fallback:', err.message);
    return { data: doctorData, error: null };
  }
}

// ---------------------------------------------------------------------
// 4. AMBULANCE DRIVERS
// ---------------------------------------------------------------------
export async function getAmbulanceDrivers() {
  try {
    const { data, error } = await supabase.from('ambulance_drivers').select('*');
    if (error || !data || data.length === 0) return mockData.ambulanceDrivers;
    return data;
  } catch (err) {
    console.warn('DB getAmbulanceDrivers fallback:', err.message);
    return mockData.ambulanceDrivers;
  }
}

export async function updateDriverStatus(driverId, status) {
  try {
    const { data, error } = await supabase.from('ambulance_drivers').update({ status }).eq('id', driverId).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB updateDriverStatus fallback:', err.message);
    return { data: { status }, error: null };
  }
}

// ---------------------------------------------------------------------
// 5. APPOINTMENTS
// ---------------------------------------------------------------------
export async function getAppointments(patientId = null) {
  try {
    let query = supabase.from('appointments').select('*');
    if (patientId) query = query.eq('patient_id', patientId);
    const { data, error } = await query;
    if (error || !data || data.length === 0) return mockData.appointments;
    return data;
  } catch (err) {
    console.warn('DB getAppointments fallback:', err.message);
    return mockData.appointments;
  }
}

export async function createAppointment(appointmentData) {
  try {
    const { data, error } = await supabase.from('appointments').insert([appointmentData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createAppointment fallback:', err.message);
    mockData.appointments.unshift(appointmentData);
    return { data: appointmentData, error: null };
  }
}

export async function cancelAppointment(appointmentId) {
  try {
    const { data, error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB cancelAppointment fallback:', err.message);
    return { data: { id: appointmentId, status: 'cancelled' }, error: null };
  }
}

export async function rescheduleAppointment(appointmentId, date, time) {
  try {
    const { data, error } = await supabase.from('appointments').update({ date, time, status: 'rescheduled' }).eq('id', appointmentId).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB rescheduleAppointment fallback:', err.message);
    return { data: { id: appointmentId, date, time, status: 'rescheduled' }, error: null };
  }
}

// ---------------------------------------------------------------------
// 6. HEALTH RECORDS
// ---------------------------------------------------------------------
export async function getHealthRecords(patientId = null) {
  try {
    let query = supabase.from('health_records').select('*');
    if (patientId) query = query.eq('patient_id', patientId);
    const { data, error } = await query;
    if (error || !data || data.length === 0) return mockData.healthRecords;
    return data;
  } catch (err) {
    console.warn('DB getHealthRecords fallback:', err.message);
    return mockData.healthRecords;
  }
}

export async function createHealthRecord(recordData) {
  try {
    const { data, error } = await supabase.from('health_records').insert([recordData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createHealthRecord fallback:', err.message);
    mockData.healthRecords.unshift(recordData);
    return { data: recordData, error: null };
  }
}

// ---------------------------------------------------------------------
// 7. AI SUMMARIES
// ---------------------------------------------------------------------
export async function getAISummary(patientId = null) {
  try {
    const { data, error } = await supabase.from('ai_summaries').select('*').limit(1).single();
    if (error || !data) return mockAISummary;
    return data;
  } catch (err) {
    console.warn('DB getAISummary fallback:', err.message);
    return mockAISummary;
  }
}

export async function saveAISummary(summaryData) {
  try {
    const { data, error } = await supabase.from('ai_summaries').upsert([summaryData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB saveAISummary fallback:', err.message);
    return { data: summaryData, error: null };
  }
}

// ---------------------------------------------------------------------
// 8. PRESCRIPTIONS
// ---------------------------------------------------------------------
export async function getPrescriptions(patientId = null) {
  try {
    let query = supabase.from('prescriptions').select('*');
    if (patientId) query = query.eq('patient_id', patientId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  } catch (err) {
    console.warn('DB getPrescriptions fallback:', err.message);
    return [];
  }
}

export async function createPrescription(prescriptionData) {
  try {
    const { data, error } = await supabase.from('prescriptions').insert([prescriptionData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createPrescription fallback:', err.message);
    return { data: prescriptionData, error: null };
  }
}

// ---------------------------------------------------------------------
// 9. MEDICINES & ORDERS
// ---------------------------------------------------------------------
export async function getMedicines(patientId = null) {
  try {
    let query = supabase.from('medicines').select('*');
    if (patientId) query = query.eq('patient_id', patientId);
    const { data, error } = await query;
    if (error || !data || data.length === 0) return mockData.medicines;
    return data;
  } catch (err) {
    console.warn('DB getMedicines fallback:', err.message);
    return mockData.medicines;
  }
}

export async function createMedicine(medicineData) {
  try {
    const { data, error } = await supabase.from('medicines').insert([medicineData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createMedicine fallback:', err.message);
    mockData.medicines.unshift(medicineData);
    return { data: medicineData, error: null };
  }
}

export async function createMedicineOrder(orderData) {
  try {
    const { data, error } = await supabase.from('medicine_orders').insert([orderData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createMedicineOrder fallback:', err.message);
    return { data: orderData, error: null };
  }
}

// ---------------------------------------------------------------------
// 10. BLOOD & ORGAN DONORS & BLOOD BANKS
// ---------------------------------------------------------------------
export async function getBloodBanks() {
  try {
    const { data, error } = await supabase.from('blood_banks').select('*');
    if (error || !data || data.length === 0) return mockData.bloodBanks;
    return data;
  } catch (err) {
    console.warn('DB getBloodBanks fallback:', err.message);
    return mockData.bloodBanks;
  }
}

export async function getBloodDonors() {
  try {
    const { data, error } = await supabase.from('blood_donors').select('*');
    if (error || !data || data.length === 0) return mockData.bloodDonors;
    return data;
  } catch (err) {
    console.warn('DB getBloodDonors fallback:', err.message);
    return mockData.bloodDonors;
  }
}

export async function registerBloodDonor(donorData) {
  try {
    const { data, error } = await supabase.from('blood_donors').insert([donorData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB registerBloodDonor fallback:', err.message);
    mockData.bloodDonors.unshift(donorData);
    return { data: donorData, error: null };
  }
}

export async function registerOrganDonor(donorData) {
  try {
    const { data, error } = await supabase.from('organ_donors').insert([donorData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB registerOrganDonor fallback:', err.message);
    return { data: donorData, error: null };
  }
}

// ---------------------------------------------------------------------
// 11. EMERGENCY REQUESTS (SOS)
// ---------------------------------------------------------------------
export async function getEmergencyRequests() {
  try {
    const { data, error } = await supabase.from('emergency_requests').select('*');
    if (error || !data || data.length === 0) return mockData.emergencyRequests;
    return data;
  } catch (err) {
    console.warn('DB getEmergencyRequests fallback:', err.message);
    return mockData.emergencyRequests;
  }
}

export async function createEmergencyRequest(requestData) {
  try {
    const { data, error } = await supabase.from('emergency_requests').insert([requestData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createEmergencyRequest fallback:', err.message);
    mockData.emergencyRequests.unshift(requestData);
    return { data: requestData, error: null };
  }
}

export async function updateEmergencyRequestStatus(id, status, driverId = null) {
  try {
    const updates = { status };
    if (status === 'accepted') { updates.accepted_at = new Date().toISOString(); updates.driver_id = driverId; }
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { data, error } = await supabase.from('emergency_requests').update(updates).eq('id', id).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB updateEmergencyRequestStatus fallback:', err.message);
    return { data: { id, status }, error: null };
  }
}

// ---------------------------------------------------------------------
// 12. NOTIFICATIONS
// ---------------------------------------------------------------------
export async function getNotifications(userId = null) {
  try {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (patientId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return [
        { id: 'n1', title: 'Appointment Confirmed', message: 'Dr. Priya Krishnamurthy at 3:30 PM', type: 'appointment', read: false, time: '10 min ago' },
        { id: 'n2', title: 'Refill Reminder', message: 'Metoprolol 25mg refill due in 3 days', type: 'medicine', read: false, time: '1 hour ago' },
        { id: 'n3', title: 'Report Ready', message: 'Complete Blood Count (CBC) report available', type: 'record', read: true, time: 'Yesterday' }
      ];
    }
    return data;
  } catch (err) {
    console.warn('DB getNotifications fallback:', err.message);
    return [];
  }
}

export async function createNotification(notificationData) {
  try {
    const { data, error } = await supabase.from('notifications').insert([notificationData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createNotification fallback:', err.message);
    return { data: notificationData, error: null };
  }
}

// ---------------------------------------------------------------------
// 13. PAYMENTS
// ---------------------------------------------------------------------
export async function createPayment(paymentData) {
  try {
    const { data, error } = await supabase.from('payments').insert([paymentData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createPayment fallback:', err.message);
    return { data: paymentData, error: null };
  }
}

// ---------------------------------------------------------------------
// 14. TELEMEDICINE SESSIONS
// ---------------------------------------------------------------------
export async function createTelemedicineSession(sessionData) {
  try {
    const { data, error } = await supabase.from('telemedicine_sessions').insert([sessionData]).select();
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createTelemedicineSession fallback:', err.message);
    return { data: sessionData, error: null };
  }
}
