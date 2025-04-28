export default class Appointment {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.donor_id = data.donor_id || '';
    this.hospital_id = data.hospital_id || '';
    this.appointment_date = data.appointment_date || new Date();
    this.status = data.status || 'scheduled'; // scheduled, completed, cancelled
    this.notes = data.notes || '';
    this.created_at = data.created_at || new Date();
  }
}
