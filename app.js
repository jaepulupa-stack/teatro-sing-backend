require('dotenv').config(); // NUEVO

const express = require('express');
const mongoose = require('mongoose'); // NUEVO

const app = express();

const PORT = 3000;

// Permitir que el servidor reciba datos en formato JSON
app.use(express.json());
app.use(express.static('public'));

const reservasRouter = require('./routes/reservas');
const validarRouter = require('./routes/validar');

app.use('/api', reservasRouter);
app.use('/api', validarRouter);


// Conexión a MongoDB Atlas // NUEVO
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch((err) => console.error('❌ Error de conexión:', err));

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Servidor de Teatro Sing funcionando correctamente 🎭'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor Teatro Sing ejecutándose en http://localhost:${PORT}`);
});