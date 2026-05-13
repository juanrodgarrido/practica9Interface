
const { DateTime } = luxon;
const API_URL = 'https://api.jsonbin.io/v3/b/6a01c991c0954111d808e177';
const API_KEY = '$2a$10$aNiMzqajvn55zozmHBr.N.uMBYDsur3995vjFxksfKwRYqspHGnBq';

export class Agenda {
  #eventos;

  constructor() {
    this.#eventos = []; //en este caso necesitamos cargar los datos desde app.js porque el metodo cargarDatos es asincrono y el constructor no lo acepta, inicializamos this.#eventos vacío y listo.
  }

  async cargarDatos() {
    
    const response = await fetch(`${API_URL}/latest`, //usamos latest para que coja la ultima versión del JSON, si no JSONBin miraría todos los registros
      {headers: {'X-Master-KEY': API_KEY} 
    }) 

    if (!response.ok) {
    console.error('Error en la petición:', response.status);
    return;
}

    const data = await response.json();
    this.#eventos = data.record;
    
  }

  async guardarDatos() {
    
    await fetch(`${API_URL}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', //Usamos el tipo MIME para que JSONBin sepa que le estamos enviando un JSON
            'X-Master-Key': API_KEY
        },
        body: JSON.stringify(this.#eventos)
    });
  }    

  comprobarSolapamiento(evento, duracion){
    let checker = false;
    const inicioNuevoEvento = DateTime.fromISO(evento);
    const finalNuevoEvento = inicioNuevoEvento.plus({minutes: duracion});

    this.#eventos.forEach((e) => {
      const inicioEvento = DateTime.fromISO(e.fecha);
      const finalEvento = inicioEvento.plus({minutes: e.duracion});
      if(inicioNuevoEvento < finalEvento && inicioEvento < finalNuevoEvento){ //comprobamos si ambos eventos empiezan antes de que finalice el otro
        checker = true;
      }
    })

    return checker;

  } 

  agregarEvento(fecha, titulo, duracion) {
    const fechaISO = DateTime.fromISO(fecha).toISO(); //convierto el string en objeto DateTime y luego aplico .toISO para que de la fecha completa
    this.#eventos.push({ fecha: fechaISO, titulo, duracion });
}

ordenarEventos(filtro){  
  let copiaEventos = [...this.#eventos]; //Uso un spread operator para conseguir una copia de mi array de eventos sin modificar el array inicial

    copiaEventos.sort((a, b) => DateTime.fromISO(a.fecha) - DateTime.fromISO(b.fecha)) //Lo que hago es usar sort para comparar pares de elementos del array hasta que quede ordenado. Esto se puede hacer
    //ya que Luxon permite restar dos objetos DateTime devolviendo la diferencia en milisegundos.

    return copiaEventos.filter((e) => { 

      const evento = DateTime.fromISO(e.fecha);
        return evento.hasSame(filtro, 'day');
      })

      

    }

    eventosHoy(){    
    const hoy = DateTime.now();
    return this.ordenarEventos(hoy);  
   }


    buscarEvento(fecha){      
    return this.ordenarEventos(fecha);
  }

 borrarEvento(seleccion){
  
  
  
  this.#eventos = this.#eventos.filter((e) => e.fecha !== seleccion);  
  this.guardarDatos();
  
}

get eventos() {
    return this.#eventos;
  }

}