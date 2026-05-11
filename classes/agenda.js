
const { DateTime } = luxon;

export class Agenda {
  #eventos;

  constructor() {
    this.#eventos = this.cargarDatos();
  }

  cargarDatos() {
    try {
      const ruta = path.join(process.cwd(), "agenda.json");
      const data = fs.readFileSync(ruta, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.log("No se pudo leer la agenda, se cargará vacía");
      return [];
    }
  }

  guardarDatos() {
    fs.writeFileSync(
      path.join(process.cwd(), "agenda.json"),
      JSON.stringify(this.#eventos, null, 2),
    );
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

  

ordenarEventos(filtro){
  let checker = false;
  let copiaEventos = [...this.#eventos]; //Uso un spread operator para conseguir una copia de mi array de eventos sin modificar el array inicial

    copiaEventos.sort((a, b) => DateTime.fromISO(a.fecha) - DateTime.fromISO(b.fecha)) //Lo que hago es usar sort para comparar pares de elementos del array hasta que quede ordenado. Esto se puede hacer
    //ya que Luxon permite restar dos objetos DateTime devolviendo la diferencia en milisegundos.

    copiaEventos.forEach((e) => {
      const evento = DateTime.fromISO(e.fecha);

      if(evento.hasSame(filtro, 'day')){
        console.log(`
          Título: ${e.titulo}
          Fecha de inicio: ${evento.toLocaleString(DateTime.DATETIME_FULL)}
          Fecha de fin: ${(evento.plus({minutes: e.duracion})).toLocaleString(DateTime.DATETIME_FULL)}
          *************************************
          `);       
        /* tolocaleString sin parametros devolvería la fecha de una forma simple, en este caso necesitamos también la hora asi que usamos el metodo DATETIME_FULL*/
        /* el metodo plus() suma a la fecha el entero que queramos a la parte de la fecha deseada, podriamos usar hours para las horas, seconds para los segundos...*/
          checker = true; 
        }
      })

      if(!checker){
        console.log("No hay ningún evento de momento")
      }

    }

    eventosHoy(){    

    const hoy = DateTime.now();
    this.ordenarEventos(hoy);  
  }

    async buscarEvento(rl){  

    const diaElegido = await this.pedirDia(rl);
    this.ordenarEventos(diaElegido);
  }

async borrarEvento(rl){
  let contador = 1;

  this.#eventos.forEach((e) => {
    const evento = DateTime.fromISO(e.fecha);  
    
    console.log(`
        ${contador}. ${e.titulo}
        ${evento.toLocaleString(DateTime.DATETIME_FULL)}
        `)
    contador++
  })

  const seleccion = await this.pedirDato("Selecciona numéricamente que evento borrar (0 para volver atrás): \n", 0, this.#eventos.length, rl);
  if(seleccion === 0){
    return;
  }
  this.#eventos.splice((seleccion - 1), 1);
  console.log('El evento se ha borrado correctamente');
  this.guardarDatos();
  
}

get eventos() {
    return this.#eventos;
  }

}