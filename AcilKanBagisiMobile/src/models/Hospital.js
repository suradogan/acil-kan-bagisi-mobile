export default class Hospital {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.name = data.name || '';
    this.address = data.address || '';
    this.city = data.city || '';
    this.phone = data.phone || '';
    this.location = data.location || { latitude: 0, longitude: 0 };
    this.blood_supply = data.blood_supply || {};
  }
}
