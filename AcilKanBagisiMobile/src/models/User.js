export default class User {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.full_name = data.full_name || '';
    this.email = data.email || '';
    this.blood_type = data.blood_type || '';
    this.phone = data.phone || '';
    this.location = data.location || null;
    this.created_at = data.created_at || new Date();
  }
}
