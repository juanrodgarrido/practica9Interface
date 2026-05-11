import { Agenda } from '../classes/Agenda.js';
const { DateTime } = luxon;
const agenda = new Agenda();

$(document).ready(async function () {
    await agenda.cargarDatos();
    
    function actualizarVacio() { //función para mostrar y ocultar el mensaje de "no hay eventos"
        if ($("#lista li").length === 0) {
        $("#vacio").show();
    } else {
        $("#vacio").hide();
    }

    }

    $(".add").click(async function (){

        const title = $(".title").val().trim();
        const fecha = $(".date").val();        
        const duracion = $(".duration").val();



        if (title === "" || fecha === "" || duracion === "") {
            alert("Faltan campos por completar");
            return;
        }

        if(duracion < 10){
            alert("La duración mínima de un evento debe ser de 10 minutos");
            return;
        }

        if(title.length > 40){
            alert("El título no puede contener más de 40 caracteres");
            return;
        }

        const fechaISO = DateTime.fromISO(fecha);

        let evento = `
            <li class="evento">
                <div>
                    <strong class = "tituloEvento">${title}</strong>
                    <p><i class="fa-regular fa-calendar"></i> ${fechaISO.toLocaleString(DateTime.DATE_FULL)}</p>
                    <p><i class="fa-regular fa-clock"></i> ${fechaISO.toLocaleString(DateTime.TIME_SIMPLE)} (${duracion} minutos)</p>
                </div>
                <div class="actions">                    
                    <button class="delete">✖</button>
                </div>
            </li>
        `;

        $("#lista").append(evento);

        $(".title").val("");
        $(".date").val("");
        $(".duration").val("");

        agenda.agregarEvento(fecha, title, parseInt(duracion));
        await agenda.guardarDatos();

        actualizarVacio();

    })

    $(".btn.hoy").click(function() {
        const eventos = agenda.eventosHoy();
        $("#lista").empty();

        eventos.forEach((e) => {
            const fecha = DateTime.fromISO(e.fecha);
            $("#lista").append(`
                <li class="evento">
                <div>
                    <strong class = "tituloEvento">${e.titulo}</strong>
                    <p><i class="fa-regular fa-calendar"></i> ${fecha.toLocaleString(DateTime.DATE_FULL)}</p>
                    <p><i class="fa-regular fa-clock"></i> ${fecha.toLocaleString(DateTime.TIME_SIMPLE)} (${e.duracion} minutos)</p>
                </div>
                <div class="actions">                    
                    <button class="delete">✖</button>
                </div>
            </li>
            `);
        })

        actualizarVacio()
    })

    
    
});