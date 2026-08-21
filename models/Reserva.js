const mongoose = require('mongoose');

const asientoSchema = new mongoose.Schema({
    sector: { type: String, enum: ['VIP', 'Preferencial', 'General'], required: true },
    numero: { type: String, required: true },
    codigoQR: { type: String, required: true, unique: true },
    estado: { type: String, enum: ['valido', 'usado'], default: 'valido' },
    fechaUso: { type: Date, default: null }
});

const reservaSchema = new mongoose.Schema({
    nombreCliente: { type: String, required: true },
    telefono: { type: String, required: true },
    correo: { type: String, required: true },
    obra: { type: String, required: true },
    precioUnitario: { type: Number, required: true },
    asientos: [asientoSchema],
    total: { type: Number, required: true },
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', reservaSchema);