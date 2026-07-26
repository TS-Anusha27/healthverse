// HealthVerse — Supabase Database Service with Mock Fallback
import { supabase } from './client.js';
import { mockData } from '../data.js';

/**
 * Fetch Hospitals from Supabase or fallback to mockData
 */
export async function getHospitals() {
  try {
    const { data, error } = await supabase.from('hospitals').select('*');
    if (error || !data || data.length === 0) {
      return mockData.hospitals;
    }
    return data;
  } catch (err) {
    console.warn('DB getHospitals fallback:', err.message);
    return mockData.hospitals;
  }
}

/**
 * Fetch Doctors from Supabase or fallback to mockData
 */
export async function getDoctors() {
  try {
    const { data, error } = await supabase.from('doctors').select('*');
    if (error || !data || data.length === 0) {
      return mockData.doctors;
    }
    return data;
  } catch (err) {
    console.warn('DB getDoctors fallback:', err.message);
    return mockData.doctors;
  }
}

/**
 * Fetch Patient Appointments
 */
export async function getAppointments(patientId = null) {
  try {
    let query = supabase.from('appointments').select('*');
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return mockData.appointments;
    }
    return data;
  } catch (err) {
    console.warn('DB getAppointments fallback:', err.message);
    return mockData.appointments;
  }
}

/**
 * Create New Appointment
 */
export async function createAppointment(appointmentData) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select();

    if (error) {
      console.warn('Create appointment DB error, saving locally:', error.message);
      mockData.appointments.unshift(appointmentData);
      return { data: appointmentData, error: null };
    }
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createAppointment fallback:', err.message);
    mockData.appointments.unshift(appointmentData);
    return { data: appointmentData, error: null };
  }
}

/**
 * Fetch Health Records
 */
export async function getHealthRecords(patientId = null) {
  try {
    let query = supabase.from('health_records').select('*');
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return mockData.healthRecords;
    }
    return data;
  } catch (err) {
    console.warn('DB getHealthRecords fallback:', err.message);
    return mockData.healthRecords;
  }
}

/**
 * Create Health Record
 */
export async function createHealthRecord(recordData) {
  try {
    const { data, error } = await supabase
      .from('health_records')
      .insert([recordData])
      .select();

    if (error) {
      console.warn('Create health record DB error, saving locally:', error.message);
      mockData.healthRecords.unshift(recordData);
      return { data: recordData, error: null };
    }
    return { data: data[0], error: null };
  } catch (err) {
    console.warn('DB createHealthRecord fallback:', err.message);
    mockData.healthRecords.unshift(recordData);
    return { data: recordData, error: null };
  }
}

/**
 * Fetch Medicines
 */
export async function getMedicines(patientId = null) {
  try {
    let query = supabase.from('medicines').select('*');
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return mockData.medicines;
    }
    return data;
  } catch (err) {
    console.warn('DB getMedicines fallback:', err.message);
    return mockData.medicines;
  }
}

/**
 * Fetch Blood Banks
 */
export async function getBloodBanks() {
  try {
    const { data, error } = await supabase.from('blood_banks').select('*');
    if (error || !data || data.length === 0) {
      return mockData.bloodBanks;
    }
    return data;
  } catch (err) {
    console.warn('DB getBloodBanks fallback:', err.message);
    return mockData.bloodBanks;
  }
}

/**
 * Fetch Emergency Requests
 */
export async function getEmergencyRequests() {
  try {
    const { data, error } = await supabase.from('emergency_requests').select('*');
    if (error || !data || data.length === 0) {
      return mockData.emergencyRequests;
    }
    return data;
  } catch (err) {
    console.warn('DB getEmergencyRequests fallback:', err.message);
    return mockData.emergencyRequests;
  }
}
