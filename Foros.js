import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import db from '../../fisebaseConfig/firebaseConfig'; // Asegúrate de importar tu configuración de Firebase correctamente
import { collection, addDoc } from 'firebase/firestore';
import '../../styles/Foros.css';  


function Foros() {
  const [nombreForo, setNombreForo] = useState('');

  const handleInputChange = (e) => {
    setNombreForo(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'foros'), {
        nombreForo: nombreForo,
      });
      alert('Foro creado correctamente');
      setNombreForo('');
    } catch (error) {
      console.error(error);
      alert('Error al crear el foro');
    }
  };

  return (
    <div className='content'>
      <div className='flex-div'>
        <div className='name-content'>
          <h1 className='logo'>Crear Foro</h1>
        </div>
        <div>
          <form className='forum' onSubmit={handleSubmit}>
            <label>
              Nombre del Foro:
              <input
                type='text'
                value={nombreForo}
                onChange={handleInputChange}
                placeholder='Foro Odyssey'
              />
            </label>
            <button className='boton' type='submit'>Crear Foro</button>
            <Link className='back' to="/evaluaciones">Regresar</Link>
          </form>
        </div>
      </div>
    </div>
  );
  
}

export default Foros;
