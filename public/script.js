let obra = "";
let precio = 0;

let asientosSeleccionados = [];

const asientosVIP =
    document.getElementById("asientosVIP");

const asientosPreferencial =
    document.getElementById("asientosPreferencial");

const asientosGeneral =
    document.getElementById("asientosGeneral");

function generarAsientos(
    contenedor,
    cantidad,
    prefijo,
    sector
) {

    if (!contenedor) {
        return;
    }

    for (let i = 1; i <= cantidad; i++) {

        const boton = document.createElement("button");

        boton.type = "button";

        boton.classList.add("asiento");

        boton.textContent = prefijo + i;

        boton.dataset.asiento = prefijo + i;

        boton.dataset.sector = sector;

        boton.addEventListener(
            "click",
            function () {
                seleccionarAsiento(this);
            }
        );

        contenedor.appendChild(boton);
    }
}

generarAsientos(
    asientosVIP,
    500,
    "V",
    "VIP"
);

generarAsientos(
    asientosPreferencial,
    1000,
    "P",
    "Preferencial"
);

generarAsientos(
    asientosGeneral,
    1500,
    "G",
    "General"
);

function seleccionarObra(nombre, valor) {

    obra = nombre;

    precio = valor;

    document.getElementById(
        "obraSeleccionada"
    ).textContent =
        "Obra seleccionada: " + nombre;

    document.getElementById(
        "precio"
    ).textContent =
        valor.toFixed(2);

    document.getElementById(
        "resumenObra"
    ).textContent =
        nombre;

    document.getElementById(
        "reserva"
    ).scrollIntoView({
        behavior: "smooth"
    });

    actualizarTotal();
}

function seleccionarAsiento(boton) {

    if (
        boton.classList.contains("ocupado")
    ) {

        alert(
            "Este asiento ya está ocupado."
        );

        return;
    }

    const numero =
        boton.dataset.asiento;

    if (
        boton.classList.contains(
            "seleccionado"
        )
    ) {

        boton.classList.remove(
            "seleccionado"
        );

        asientosSeleccionados =
            asientosSeleccionados.filter(
                function (item) {

                    return item !== numero;

                }
            );

    }

    else {

        boton.classList.add(
            "seleccionado"
        );

        asientosSeleccionados.push(
            numero
        );
    }

    actualizarAsientos();

    actualizarTotal();
}

function actualizarAsientos() {

    const lista =
        document.getElementById(
            "listaAsientos"
        );

    if (
        asientosSeleccionados.length === 0
    ) {

        lista.textContent =
            "Ninguno";

    } else {

        lista.textContent =
            asientosSeleccionados.join(
                ", "
            );
    }
}

function actualizarTotal() {

    const total =
        asientosSeleccionados.length *
        precio;

    document.getElementById(
        "total"
    ).textContent =
        total.toFixed(2);
}

function obtenerSector(numero) {
    if (numero.startsWith("V")) return "VIP";
    if (numero.startsWith("P")) return "Preferencial";
    return "General";
}

async function confirmarReserva() {

    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const correo = document.getElementById("correo").value.trim();

    if (obra === "") {
        alert("Seleccione una obra.");
        return;
    }

    if (nombre === "" || telefono === "" || correo === "") {
        alert("Complete todos los datos del cliente.");
        return;
    }

    if (asientosSeleccionados.length === 0) {
        alert("Seleccione al menos un asiento.");
        return;
    }

    const total = asientosSeleccionados.length * precio;

    const asientosParaEnviar = asientosSeleccionados.map(function (numero) {
        return {
            sector: obtenerSector(numero),
            numero: numero
        };
    });

    try {
        const respuesta = await fetch("/api/reservar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombreCliente: nombre,
                telefono: telefono,
                correo: correo,
                obra: obra,
                precioUnitario: precio,
                asientos: asientosParaEnviar
            })
        });

        if (!respuesta.ok) {
            throw new Error("Error del servidor");
        }

                const datos = await respuesta.json();

        const contenedor = document.getElementById("contenedorQRs");
        contenedor.innerHTML = "";

        datos.asientos.forEach(function (asiento) {
            const caja = document.createElement("div");
            caja.style.background = "#fff";
            caja.style.padding = "15px";
            caja.style.borderRadius = "10px";
            caja.style.width = "200px";

            const titulo = document.createElement("p");
            titulo.style.color = "#000";
            titulo.style.fontWeight = "bold";
            titulo.textContent = asiento.sector + " - " + asiento.numero;

                        const canvas = document.createElement("canvas");

            const botonDescargar = document.createElement("button");
            botonDescargar.textContent = "⬇ Descargar";
            botonDescargar.style.marginTop = "10px";
            botonDescargar.style.padding = "8px 15px";
            botonDescargar.style.background = "#d4af37";
            botonDescargar.style.border = "none";
            botonDescargar.style.borderRadius = "5px";
            botonDescargar.style.cursor = "pointer";
            botonDescargar.style.fontWeight = "bold";

            botonDescargar.onclick = function () {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "boleto-" + asiento.sector + "-" + asiento.numero + ".png";
                link.click();
            };

            caja.appendChild(titulo);
            caja.appendChild(canvas);
            caja.appendChild(botonDescargar);
            contenedor.appendChild(caja);

            new QRious({ element: canvas, value: asiento.codigoQR, size: 160 });
        });

        document.getElementById("modalQR").style.display = "block";

        const botones = document.querySelectorAll(".asientos button");

        botones.forEach(function (boton) {
            const numero = boton.dataset.asiento;
            if (asientosSeleccionados.includes(numero)) {
                boton.classList.remove("seleccionado");
                boton.classList.add("ocupado");
                boton.disabled = true;
            }
        });

        asientosSeleccionados = [];
        actualizarAsientos();
        actualizarTotal();

        document.getElementById("nombre").value = "";
        document.getElementById("telefono").value = "";
        document.getElementById("correo").value = "";

    } catch (error) {
        alert("Hubo un error al guardar tu reserva. Intenta de nuevo.");
        console.error(error);
    }
}