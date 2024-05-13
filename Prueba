import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import db from '../../fisebaseConfig/firebaseConfig';
import '../../styles/Asignacion.css';

function ColaboradoresTabla() {
  const [colaboradores, setColaboradores] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proyectosSeleccionados, setProyectosSeleccionados] = useState({});

  useEffect(() => {
    const obtenerColaboradores = async () => {
      const colaboradoresSnapshot = await getDocs(collection(db, 'colaboradores'));
      const colaboradoresData = colaboradoresSnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
        proyecto: doc.data().proyecto || 'Sin asignar',
        estado: doc.data().estado || 'libre' // Asignar un valor por defecto si no existe
      }));
      setColaboradores(colaboradoresData);
    };

    const obtenerProyectos = async () => {
      const proyectosSnapshot = await getDocs(collection(db, 'proyecto'));
      const proyectosData = proyectosSnapshot.docs.map(doc => ({
        id: doc.id,
        nombreProyecto: doc.data().nombreProyecto,
        colaboradores: doc.data().colaboradores || []
      }));
      setProyectos(proyectosData);
    };

    obtenerColaboradores();
    obtenerProyectos();
  }, []);

  const handleAsignarProyecto = async (colaboradorId, colaboradorNombre) => {
    const proyectoSeleccionado = proyectosSeleccionados[colaboradorId];
    try {
      if (proyectoSeleccionado === 'Eliminar') {
        await eliminarColaboradorDeProyecto(colaboradorNombre, colaboradorId);
      } else {
        // Actualiza el campo proyecto del colaborador
        await updateDoc(doc(db, 'colaboradores', colaboradorId), { proyecto: proyectoSeleccionado });

        // Actualiza la lista de colaboradores en el proyecto
        const proyectoActualizado = proyectos.find(proyecto => proyecto.nombreProyecto === proyectoSeleccionado);
        if (proyectoActualizado) {
          const colaboradoresActualizados = arrayUnion(colaboradorNombre);
          await updateDoc(doc(db, 'proyecto', proyectoActualizado.id), { colaboradores: colaboradoresActualizados });
        }
        // Actualiza el estado del colaborador a "Trabajando en proyecto"
        await updateDoc(doc(db, 'colaboradores', colaboradorId), { estado: 'Trabajando en proyecto' });
      }
      alert('Modificación exitosa!');
    } catch (error) {
      console.error('Error al asignar proyecto:', error);
    }
  };

  const eliminarColaboradorDeProyecto = async (colaboradorNombre, colaboradorId) => {
    try {
      // Elimina al colaborador del array de colaboradores en todos los proyectos
      for (const proyecto of proyectos) {
        if (proyecto.colaboradores.includes(colaboradorNombre)) {
          const colaboradoresActualizados = arrayRemove(colaboradorNombre);
          await updateDoc(doc(db, 'proyecto', proyecto.id), { colaboradores: colaboradoresActualizados });
        }
      }
      // Actualiza el estado del colaborador a "libre"
      await updateDoc(doc(db, 'colaboradores', colaboradorId), { estado: 'libre' });

      // Elimina el proyecto del campo proyecto del colaborador
      await updateDoc(doc(db, 'colaboradores', colaboradorId), { proyecto: 'Sin asignar' });
    } catch (error) {
      console.error('Error al eliminar colaborador de proyecto:', error);
    }
  };

  const handleSeleccionProyecto = (colaboradorId, proyectoNombre) => {
    setProyectosSeleccionados({
      ...proyectosSeleccionados,
      [colaboradorId]: proyectoNombre
    });
  };

  return (
    <div className='content'>
      <div className='flex-div'>
        <div className='name-content'>
          <h1 className='logo'>Asignación</h1>
        </div>
        <table className="content-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Proyecto</th>
              <th>Asignar</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map(colaborador => (
              <tr key={colaborador.id}>
                <td>{colaborador.nombre}</td>
                <td>{colaborador.proyecto}</td>
                <td>
                  <select className='asilaselecta' value={proyectosSeleccionados[colaborador.id] || ''} onChange={e => handleSeleccionProyecto(colaborador.id, e.target.value)}>
                    <option value="">Proyecto</option>
                    {proyectos.map(proyecto => (
                      <option key={proyecto.id} value={proyecto.nombreProyecto}>
                        {proyecto.nombreProyecto}
                      </option>
                    ))}
                    {colaborador.proyecto && (
                      <option value="Eliminar">Eliminar</option>
                    )}
                  </select>
                  <button className='asiboton' onClick={() => handleAsignarProyecto(colaborador.id, colaborador.nombre)}>
                    Asignar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <br/>
      <div className='back-container'>
        <Link className='back' to="/gestionColaboradores">Regresar</Link>
      </div>
    </div>
  );
}

export default ColaboradoresTabla;
