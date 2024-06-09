import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../../fisebaseConfig/firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import '../../styles/Reuniones.css';  

function Reuniones() {
    const [tema, setTema] = useState('');
    const [fecha, setFecha] = useState('');
    const [medio, setMedio] = useState('');
    const [colaboradores, setColaboradores] = useState([]);
    const [selectedColaboradores, setSelectedColaboradores] = useState([]);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const fetchColaboradores = async () => {
            const colaboradoresCollection = collection(db, 'colaboradores');
            const querySnapshot = await getDocs(colaboradoresCollection);
            const colaboradoresList = querySnapshot.docs.map(doc => doc.data());
            setColaboradores(colaboradoresList);
        };
        fetchColaboradores();
    }, []);

    const reunionesCollection = collection(db, 'reuniones');
    const mailCollection = collection(db, 'mail');

    const storeReuniones = async (e) => {
        e.preventDefault();
        try {
            const toEmails = selectedColaboradores.map(colaborador => colaborador.correo);

            await addDoc(reunionesCollection, { 
                tema: tema, 
                fecha: fecha, 
                medio: medio, 
                colaboradores: selectedColaboradores.map(colaborador => colaborador.nombre),
            });

            await addDoc(mailCollection, { 
                to: toEmails,
                message: {
                    subject: tema,
                    text: tema, // Cambiado para concatenar correctamente los valores
                    html: `<p> Tema de la reunión: ${tema}</p>
                    <p>Enlace de la reunión: ${medio}</p> 
                    <p>Agendada para el: ${fecha}</p>`,
                },
            });

            alert('Reunión registrada correctamente');
            setTema('');
            setFecha('');
            setMedio('');
            setSelectedColaboradores([]);
            setTimeout(() => {
                setMensaje('');
            }, 3000);
        } catch (error) {
            console.error('Error al registrar la reunión', error);
        }
    }

    const handleCheckboxChange = (colaborador) => {
        const updatedColaboradores = [...selectedColaboradores];
        const existingIndex = updatedColaboradores.findIndex(c => c.nombre === colaborador.nombre);
        if (existingIndex !== -1) {
            updatedColaboradores.splice(existingIndex, 1);
        } else {
            updatedColaboradores.push(colaborador);
        }
        setSelectedColaboradores(updatedColaboradores);
    }

    return (
        <div className='content'>
            <div className='flex-div'>
                <div className='name-content'>
                    <h1 className='logo'>Crear Reunión</h1>
                </div>
                <div>
                    <form className='reu' onSubmit={storeReuniones}>
                        <label htmlFor='tema'>Tema: </label>
                        <input type='text' value={tema} id='tema' name='tema' onChange={(e) => setTema(e.target.value)} placeholder="Tema Genesis" required />
                        <label htmlFor='fecha'>Fecha: </label>
                        <input type='text' value={fecha} id='fecha' name='fecha' onChange={(e) => setFecha(e.target.value)} placeholder="01/01/2024" required />
                        <label htmlFor='medio'>Medio: </label>
                        <input type='text' value={medio} id='medio' name='medio' onChange={(e) => setMedio(e.target.value)} placeholder="Zoom" required />
                        <label>Colaboradores:</label>
                        {colaboradores.map(colaborador => (
                            <div key={colaborador.id} className='check'>
                                <input
                                    type="checkbox"
                                    value={colaborador.nombre}
                                    onChange={() => handleCheckboxChange(colaborador)}
                                    checked={selectedColaboradores.some(c => c.nombre === colaborador.nombre)}
                                />
                                <label>{colaborador.nombre}</label>
                            </div>
                        ))}
                        <div>
                            <button className='boton' type='submit'>Crear Reunión</button>
                            <Link className='back' type="button" to="/gestionProyectos">Regresar</Link>
                        </div>
                    </form>
                    <div>{mensaje}</div>
                </div>
            </div>
        </div>
    )
}

export default Reuniones;

