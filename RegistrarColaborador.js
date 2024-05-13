// RegistrarColaborador.js
import React, { useState, useEffect } from 'react';
import db from '../../fisebaseConfig/firebaseConfig';
import { Link } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import '../../styles/RegistrarColaborador.css';  


function RegistrarColaborador() {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [estado, setEstado] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [proyectos, setProyectos] = useState([]);
  const [showProyectosDropdown, setShowProyectosDropdown] = useState(false);

  useEffect(() => {
    const fetchProyectos = async () => {
      const proyectosCollection = collection(db, 'proyecto');
      const proyectosSnapshot = await getDocs(proyectosCollection);
      const proyectosData = proyectosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProyectos(proyectosData);
    };
    fetchProyectos();
  }, []);

  const handleEstadoChange = (e) => {
    setEstado(e.target.value);
    if (e.target.value === 'trabajando') {
      setShowProyectosDropdown(true);
    } else {
      setShowProyectosDropdown(false);
      setProyecto('');
    }
  };

  const store = async (e) => {
    e.preventDefault();
  
  
    // Validar que no haya un colaborador con la misma cédula
    const cedulaQuery = await getDocs(query(collection(db, 'colaboradores'), where('cedula', '==', cedula)));
    if (!cedulaQuery.empty) {
      alert('Ya existe un colaborador con la misma cédula.');
      return;
    }

    const correoQuery = await getDocs(query(collection(db, 'colaboradores'), where('correo', '==', correo)));
    if (!correoQuery.empty) {
      alert('Ya existe otro colaborador con el mismo correo.');
      return;
    }

    const telefonoQuery = await getDocs(query(collection(db, 'colaboradores'), where('telefono', '==', telefono)));
    if (!telefonoQuery.empty) {
      alert('Ya existe otro colaborador con ese número de teléfono');
      return;
    }
  
    // Validar formato de correo electrónico
    if (!correo.endsWith('@estudiantec.cr')) {
      alert('El correo electrónico debe ser de la forma: usuario@estudiantec.cr');
      return;
    }
  
    // Resto del código para almacenar el colaborador si pasa las validaciones
    await addDoc(collection(db, 'colaboradores'), {
      nombre: nombre,
      cedula: cedula,
      correo: correo,
      departamento: departamento,
      telefono: telefono,
      estado: estado,
      proyecto: proyecto
    });
  
    // Obtener referencia al documento del proyecto utilizando el nombre del proyecto
    if (estado === 'trabajando') {
      const proyectosCollection = collection(db, 'proyecto');
      const querySnapshot = await getDocs(query(proyectosCollection, where('nombreProyecto', '==', proyecto)));
      if (!querySnapshot.empty) {
        const proyectoDoc = querySnapshot.docs[0];
        const proyectoId = proyectoDoc.id;
  
        // Actualizar el array colaboradores en el documento del proyecto
        await updateDoc(doc(db, 'proyecto', proyectoId), {
          colaboradores: arrayUnion(nombre)
        });
      }
    }
  
    alert('Colaborador registrado correctamente');
    setNombre('');
    setCedula('');
    setCorreo('');
    setDepartamento('');
    setTelefono('');
    setEstado('');
    setProyecto('');
    setTimeout(() => {
      setMensaje('');
    }, 3000);
  };

  return (
    <div className='content'>
        <div className='flex-div'>
          <div className='name-content'>
            <h1 className='logo'>Registro de Colaborador</h1>
          </div>
        <form className='rcola' onSubmit={store}>
            <label htmlFor="nombre">Nombre completo:</label>
            <input type="text" id="nombre" name="nombre" placeholder="John Doe" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <label htmlFor="cedula">Cédula:</label>
            <input type="text" id="cedula" name="cedula" placeholder="123456789" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
            <label htmlFor="correo">Correo Electrónico:</label>
            <input type="email" id="correo" name="correo" placeholder="john.doe@estudiantec.cr" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            <label htmlFor="departamento">Departamento:</label>
            <input type="text" id="departamento" name="departamento" placeholder="Financiero contable" value={departamento} onChange={(e) => setDepartamento(e.target.value)} required />
            <label htmlFor="telefono">Teléfono:</label>
            <input type="text" id="telefono" name="telefono" placeholder="81234567" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
            <label htmlFor="estado">Estado:</label>
            <select id="estado" className='laselecta' name="estado" value={estado} onChange={handleEstadoChange} required>
              <option value="" disabled>Seleccionar estado</option>
              <option value="trabajando">Trabajando en un proyecto</option>
              <option value="libre">Libre</option>
            </select>
          {showProyectosDropdown && (
            <div className='segundoD'>
              <label htmlFor='proyecto'>Nombre de Proyecto:</label>
              <select className='laselecta' id="proyecto" name='proyecto' value={proyecto} onChange={(e) => setProyecto(e.target.value)} required>
                <option value="" disabled>Seleccionar proyecto</option>
                {proyectos.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.nombreProyecto}>{proyecto.nombreProyecto}</option>
                ))}
              </select>
            </div>
          )}
          <button className="boton" type="submit">
            Registrar Colaborador
          </button>
          <Link className='back' to="/gestionColaboradores">Regresar</Link>
        </form>
      </div>
    </div>
  )
}

export default RegistrarColaborador;