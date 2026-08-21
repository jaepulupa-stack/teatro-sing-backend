const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Reserva = require('../models/Reserva');

// Crear una reserva (uno o varios asientos)
router.post('/reservar', async (req, res) => {
    try {
        const { nombreCliente, telefono, correo, obra, precioUnitario, asientos } = req.body;

        const asientosConQR = asientos.map(a => ({
            sector: a.sector,
            numero: a.numero,
            codigoQR: uuidv4()
        }));

        const total = precioUnitario * asientosConQR.length;

        const nuevaReserva = new Reserva({
            nombreCliente,
            telefono,
            correo,
            obra,
            precioUnitario,
            asientos: asientosConQR,
            total
        });

        await nuevaReserva.save();
        res.status(201).json(nuevaReserva);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Listar todas las reservas
router.get('/boletos', async (req, res) => {
    const reservas = await Reserva.find();
    res.json(reservas);
});

module.exports = router;