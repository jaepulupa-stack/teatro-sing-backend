const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');

router.post('/validar-qr', async (req, res) => {
    try {
        const { codigoQR } = req.body;

        const reserva = await Reserva.findOne({ 'asientos.codigoQR': codigoQR });
        if (!reserva) {
            return res.status(404).json({ valido: false, mensaje: 'Código no encontrado' });
        }

        const asiento = reserva.asientos.find(a => a.codigoQR === codigoQR);

        if (asiento.estado === 'usado') {
            return res.status(400).json({ valido: false, mensaje: 'Este código ya fue usado', fechaUso: asiento.fechaUso });
        }

        asiento.estado = 'usado';
        asiento.fechaUso = new Date();
        await reserva.save();

        res.json({ valido: true, mensaje: 'Acceso concedido', cliente: reserva.nombreCliente, sector: asiento.sector });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;