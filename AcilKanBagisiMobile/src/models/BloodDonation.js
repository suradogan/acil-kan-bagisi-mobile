export default class BloodDonation {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.donor_id = data.donor_id || '';
    this.donation_date = data.donation_date || new Date();
    this.blood_type = data.blood_type || '';
    this.amount_ml = data.amount_ml || 450;
    this.donation_center = data.donation_center || '';
    this.notes = data.notes || '';
  }
}
