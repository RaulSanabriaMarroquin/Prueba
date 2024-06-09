import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import db from '../../fisebaseConfig/firebaseConfig';
import '../../styles/ConsultarForo.css';  

function ConsultarForo() {
  const [foros, setForos] = useState([]);
  const [selectedForo, setSelectedForo] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mostrarCajaTexto, setMostrarCajaTexto] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'foros'), (snapshot) => {
      const forosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(forosData); // Verifica los datos recibidos desde Firestore
      setForos(forosData);
    });

    return () => unsubscribe();
  }, []);

  const handleForoChange = (event) => {
    setSelectedForo(event.target.value);
    const selectedForoData = foros.find(foro => foro.id === event.target.value) || { mensaje: [] };
    setMensajes(selectedForoData ? selectedForoData.mensaje : []);
  };

  const handleMostrarCajaTexto = () => {
    setMostrarCajaTexto(true);
  };

  const handleEnviarMensaje = async (event) => {
    event.preventDefault(); // Evitar el comportamiento predeterminado del formulario
  
    if (nuevoMensaje.trim() === '') return;
    
    const foroDocRef = doc(db, 'foros', selectedForo);
    await updateDoc(foroDocRef, {
      mensaje: arrayUnion(nuevoMensaje.trim())
    });
    
    window.alert('Mensaje enviado');
    setNuevoMensaje('');
    setMostrarCajaTexto(false);
    
    // Actualizar el estado de los mensajes después de agregar el nuevo mensaje
    setMensajes(prevMensajes => {
      if (!Array.isArray(prevMensajes)) {
        return [nuevoMensaje.trim()];
      }
      return [...prevMensajes, nuevoMensaje.trim()];
    });
  };

  return (
    <div className='content'>
      <div className='flex-div'>
        <div className='name-content'>
          <h1 className='logo'>Consultar Foro</h1>
        </div>
        <form className='consuforo' onSubmit={handleEnviarMensaje}>
          <label htmlFor="foroSelect">Selecciona un foro:</label>
          <select className='laselecta' id="foroSelect"  value={selectedForo} onChange={handleForoChange}>
            <option value="">Selecciona un foro</option>
            {foros.map(foro => (
              <option key={foro.id} value={foro.id}>{foro.nombreForo}</option>
            ))}
          </select>
          {selectedForo && (
            <div>
              <br />
              <h2>Mensajes del foro: {mensajes ? mensajes.length : 0}</h2>
              <br />
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {mensajes && mensajes.map((mensaje, index) => (
                  <React.Fragment key={index}>
                    <li>{mensaje}</li>
                    <hr />
                    <br/>
                  </React.Fragment>
                ))}
              </ul>
              {!mostrarCajaTexto && (
                <button className='boton' onClick={handleMostrarCajaTexto}>Agregar mensaje</button>
              )}
              {mostrarCajaTexto && (
                <div>
                  <textarea className="cajita" type="text" value={nuevoMensaje} onChange={(e) => setNuevoMensaje(e.target.value)} placeholder='¡Hola a todos!'/>
                  <button className='boton' onClick={handleEnviarMensaje}>Enviar</button>
                </div>
              )}
            </div>
          )}
          <br /><Link className='back' to="/evaluaciones">Regresar</Link>
        </form>
      </div>
    </div>
  );
}

export default ConsultarForo;
