import React, { useState, useEffect } from 'react';
import db from '../../fisebaseConfig/firebaseConfig';
import { collection, query, getDocs, doc, updateDoc, arrayUnion, where, arrayRemove, getDoc} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../../styles/ModificarColaborador.css';  


function ModificarColaborador() {
  const [cedula, setCedula] = useState('');
  const [colaborador, setColaborador] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false); 
  const [usuarioNoEncontrado, setUsuarioNoEncontrado] = useState(false);
  const [estado, setEstado] = useState(""); 
  const [showProyectosDropdown, setShowProyectosDropdown] = useState(false);
  const [proyecto, setProyecto] = useState('');
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    // Acciones del formulario
    if (!cedula && colaborador) { // Si la cédula está vacía y el formulario está abierto
      setMostrarFormulario(false); // Cerrar el formulario
      setColaborador(null); // Limpiar los datos del colaborador
    }
  }, [cedula]); // Ejecutar este efecto cada vez que cambie la cédula

  // Función para manejar el cambio de estado
  const handleEstadoChange = (e) => {
    const selectedEstado = e.target.value;
    setEstado(selectedEstado); // Actualizar el estado del componente según la opción seleccionada
    if (selectedEstado === 'Trabajando en proyecto') {
      loadProyectos(); // Cargar la lista de proyectos
      setShowProyectosDropdown(true); // Mostrar el dropdown de proyectos
    } else {
      setShowProyectosDropdown(false); // Ocultar el dropdown de proyectos
      setProyecto(''); // Limpiar el proyecto seleccionado
    }
  };

  const handleProyectoChange = (e) => {
    setProyecto(e.target.value); // Actualizar el proyecto seleccionado
  };

  const loadProyectos = async () => {
    const proyectosCollection = collection(db, 'proyecto');
    const querySnapshot = await getDocs(proyectosCollection);
    const proyectosData = [];
    querySnapshot.forEach((doc) => {
      proyectosData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    setProyectos(proyectosData);
  };

  const handleSubmit = async (e) => {
    //Función que se encarga de manejar el evento de submit del formulario
    e.preventDefault();
    await searchColaborador();
    setMostrarFormulario(true); 
  };

  const searchColaborador = async () => {
    const colaboradoresCollection = collection(db, 'colaboradores');
    const q = query(colaboradoresCollection, where('cedula', '==', cedula));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size > 0) {
        const colaboradoresDoc = querySnapshot.docs[0];
        const colaboradorData = colaboradoresDoc.data();
        setColaborador({
          id: colaboradoresDoc.id,
          ...colaboradorData
        });

        setUsuarioNoEncontrado(false);
      } else {
        setUsuarioNoEncontrado(true);
        setTimeout(() => {
          setUsuarioNoEncontrado(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error al buscar colaborador:", error);
    }
  };

  const updateColaborador = async () => {
    //Función que se encarga de actualizar el colaborador en la base de datos
    if (!colaborador) {
      return;
    }
    try {
      const colaboradorDocRef = doc(db, "colaboradores", colaborador.id);
      let proyectoNombre = estado === "libre" ? "Sin asignar" : "";
      if (estado === "Trabajando en proyecto" && proyecto) {
        const proyectoData = proyectos.find(p => p.id === proyecto);
        proyectoNombre = proyectoData ? proyectoData.nombreProyecto : "";
      }
      const newData = {
        correo: colaborador.correo, 
        telefono: colaborador.telefono, 
        departamento: colaborador.departamento, 
        estado: estado, // Usa el estado actualizado
        proyecto: proyectoNombre
      };
      await updateDoc(colaboradorDocRef, newData); 
  
      // Si el estado cambia de Trabajando en proyecto a libre, y el colaborador estaba asociado a un proyecto
      if (colaborador.estado === "Trabajando en proyecto" && estado === "libre" && colaborador.proyecto !== "Sin asignar") {
        // Buscar el documento del proyecto por su nombre
        const proyectosQuery = query(collection(db, "proyecto"), where("nombreProyecto", "==", colaborador.proyecto));
        const proyectosQuerySnapshot = await getDocs(proyectosQuery);
        proyectosQuerySnapshot.forEach(async (doc) => {
          const proyectoDocRef = doc.ref;
          await updateDoc(proyectoDocRef, {
            colaboradores: arrayRemove(colaborador.nombre)
          });
        });
      }
  
      // Si el estado cambia de cualquier estado a Trabajando en proyecto, y se selecciona un proyecto
      if (colaborador.estado !== "Trabajando en proyecto" && estado === "Trabajando en proyecto" && proyecto) {
        const proyectoDocRef = doc(db, "proyecto", proyecto);
        const proyectoDoc = await getDoc(proyectoDocRef);
        if (proyectoDoc.exists()) {
          await updateDoc(proyectoDocRef, {
            colaboradores: arrayUnion(colaborador.nombre)
          });
        } else {
          console.error("El documento del proyecto no existe:", proyecto);
        }
      }
  
      //Esto actualiza los datos del colaborador
      alert("Colaborador actualizado correctamente.");
      setCedula('');
      setColaborador(null);
      setMostrarFormulario(false);
    } catch (error) {
      console.error(error);
      alert("Error actualizando colaborador.");
    }
  };

  return (
    <div className='content'>
    <div className='flex-div'>
      <div className='name-content'>
        <h1 className='logo'>Modificación de Colaborador</h1>
      </div>
      <form className='mcola' onSubmit={handleSubmit}>
        <label>
          Cédula:
          <input type="text" placeholder="123456789" value={cedula} onChange={(e) => setCedula(e.target.value)} />
        </label>
        <br />
        <button className='boton' type="submit">Buscar</button> 
        <br/> 
        <Link className='back' to="/gestionColaboradores">Regresar</Link>
      </form>
  
      {usuarioNoEncontrado && (
        <form className='mcola2'>
        <label>
          No se encontró un colaborador con la cédula ingresada.
        </label>
        </form>
      )}
  
      {mostrarFormulario && colaborador && (
        <form className='mcola3'>
          <label>
            Correo:
            <input type="email" name="correo" value={colaborador.correo} onChange={(e) => setColaborador({ ...colaborador, correo: e.target.value })} disabled={!colaborador} />
          </label>
          <br />
          <label>
            Teléfono:
            <input type="tel" name="telefono" value={colaborador.telefono} onChange={(e) => setColaborador({ ...colaborador, telefono: e.target.value })} disabled={!colaborador} />
          </label>
          <br />
          <label>
            Departamento:
            <input type="text" name="departamento" value={colaborador.departamento} onChange={(e) => setColaborador({ ...colaborador, departamento: e.target.value })} disabled={!colaborador} />
          </label>
          <br />
          <label>
            Estado:
            <select className='laselecta' name="estado" value={estado} onChange={handleEstadoChange} disabled={!colaborador}>
                <option value="" disabled>Seleccionar estado</option>
                <option value="Trabajando en proyecto">Trabajando en un proyecto</option>
                <option value="libre">Libre</option>
            </select>
          </label>
          <br />
          <div>
            {showProyectosDropdown && (
              <div className='proyectoModificarColaborador'>
                <label htmlFor='proyecto' name='proyecto'>Nombre Proyecto: </label>
                <select className='laselecta' id='proyecto' name='proyecto' value={proyecto} onChange={handleProyectoChange} required>
                  <option value="" disabled>Seleccionar proyecto</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>{proyecto.nombreProyecto}</option>
                  ))}
                </select>
              </div>  
            )}
          </div>
          <br />
          <button className='boton' type="button" onClick={updateColaborador} disabled={!colaborador}>Actualizar
          </button>
        </form>
      )}
    </div>
  </div>
  );
}

export default ModificarColaborador;
