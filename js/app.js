import { Agenda } from '../classes/agenda.js';
const { DateTime } = luxon;
const agenda = new Agenda();
let checker = false; //uso checker para comprobar si tenemos el boton "hoy" pulsado, para que si añades un evento con fecha hoy y está pulsado el botón directamente se vea

$(document).ready(async function () {
    $(".seleccionarFecha").hide();
    await agenda.cargarDatos();
    
    function actualizarVacio() { //función para mostrar y ocultar el mensaje de "no hay eventos"
        if ($("#lista li").length === 0) {
        $("#vacio").show();
    } else {
        $("#vacio").hide();
    }

    }


    $(".add").click(async function() {    

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

        if(agenda.comprobarSolapamiento(fecha, duracion)){
            alert("El evento se solapa con otro evento, no podemos añadirlo a la lista.");
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

        $(".title").val("");
        $(".date").val("");
        $(".duration").val("");

        if(fechaISO.hasSame(DateTime.now(), "day") && checker === true){ 
            $("#lista").append(evento);

        }
        agenda.agregarEvento(fecha, title, parseInt(duracion));
        await agenda.guardarDatos();

        actualizarVacio();

    })

    function mostrarEvento(eventos){ //función que muestra los eventos en el HTML

        eventos.forEach((e) => {
            const fecha = DateTime.fromISO(e.fecha);
            $("#lista").append(`
                <li class="evento" data-fecha="${e.fecha}">
                <div>
                    <strong class = "tituloEvento">${e.titulo}</strong>
                    <p><i class="fa-regular fa-calendar"></i> ${fecha.toLocaleString(DateTime.DATE_FULL)}</p>
                    <p><i class="fa-regular fa-clock"></i> ${fecha.toLocaleString(DateTime.TIME_SIMPLE)} (${e.duracion} minutos)</p>
                </div>
                <div class="actions">                    
                    <button class="delete">✖</button>
                </div>
            </li>
            `); //Guardo gracias a data- (de HTML5) una variable dentro del propio <li>, lo usaré luego para poder borrar los eventos
        })

        actualizarVacio()

    }    

    $(".btn.hoy").click(function() {
        $(".seleccionarFecha").hide();
    const eventos = agenda.eventosHoy();
    $("#lista").empty();
    mostrarEvento(eventos);
    $(".btn.buscarFecha").addClass("blanco");
    $(".btn.hoy.blanco").removeClass("blanco");
    $(".conjunto").removeClass("linea");
    checker = true;      
    })


    $(".btn.buscarFecha").click(function() {
        $(".seleccionarFecha").show();
        $("#lista").empty();
        $("#vacio").hide();
        $(".btn.hoy").addClass("blanco");
        $(".btn.buscarFecha.blanco").removeClass("blanco");
        $(".conjunto").addClass("linea");
        checker = false;
    })

    $(".btn.buscar").click(function() {
        const fecha = $(".fechaseleccionarFecha").val(); 

        if(fecha === ""){
            alert("Tienes que seleccionar una fecha");
            return;
        }       
        
        
        $("#lista").empty();
        const eventosFormato = DateTime.fromISO(fecha)
        const eventos = agenda.buscarEvento(eventosFormato);
        $(".conjunto").removeClass("linea");
        

        mostrarEvento(eventos)
        $(".fechaseleccionarFecha").val("");
    
    })

    $(document).on("click", ".delete", async function () { //usamos document por si queremos borrar un evento recien añadido
        
        if (confirm("¿Estás seguro de que deseas eliminar este elemento?")) {
            const evento = $(this).closest("li")
            const fechaISO = evento.data("fecha"); //aqui usamos .data para sacar los datos que guardamos antes en el <li>
            
            
            agenda.borrarEvento(fechaISO) 
            evento.remove();
            actualizarVacio()  
                     
        }
        
        
    });

    
    
});