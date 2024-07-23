import React, { useEffect, useState } from 'react';
import { fetchJurisdictions, fetchSubJurisdictions } from '../../utils/api';
import './JurisdictionSelector.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const JurisdictionSelector = () => {
    // hook useState - Estado para almacenar las jurisdicciones principales (el segundo valor actualiza el estado del primero con el valor que le pases)
    const [jurisdictions, setJurisdictions] = useState([]);

    // hook useState - Estado para almacenar las jurisdicciones expandidas (con matriz)
    const [expandedJurisdictions, setExpandedJurisdictions] = useState(new Set());

    // hook useState - Estado para almacenar un conjunto de IDs de jurisdicciones seleccionadas (con conjunto)
    const [selectedJurisdictions, setSelectedJurisdictions] = useState(new Set());

    // hook useState - Estado para el uso del componente LoadingSpinner
    const [loading, setLoading] = useState(false)

    // Componente LoadingSpinner
    const Loader = () => (
        <LoadingSpinner />
    )

    // hook useEffect para cargar las jurisdicciones principales cuando el componente se monta
    useEffect(() => {
        // Llama a la función para cargar las jurisdicciones
        loadJurisdictions();
    }, []); // Dependencias vacías aseguran que esta función solo se ejecute al montar el componente

    // Función para cargar las jurisdicciones desde la API
    const loadJurisdictions = async () => {
        // Inicio el elemento de carga
        setLoading(true);
        try {
            // Llama a la API para obtener las jurisdicciones
            const data = await fetchJurisdictions();
            // Actualiza el estado con las jurisdicciones obtenidas
            setJurisdictions(data);
            // Paro el elemento de carga
            setLoading(false);
        } catch (error) {
            // Manejo de errores en caso de que la solicitud falle
            console.error('Error fetching jurisdictions:', error);
            // Paro el elemento de carga
            setLoading(false);
        }
    }

    // Función para manejar el clic en una jurisdicción
    const handleJurisdictionClick = async (jurisdiction) => {
        // Copia el conjunto actual de jurisdicciones expandidas
        const updatedExpandedJurisdictions = new Set(expandedJurisdictions);
        // Inicio el elemento de carga
        setLoading(true);

        if (expandedJurisdictions.has(jurisdiction.id)) {
            // Si la jurisdicción esta en la lista de expandidas y haces click, la elimina de la lista por lo que la contrae
            updatedExpandedJurisdictions.delete(jurisdiction.id);
            setLoading(false);
        } else {
            // Si la jurisdicción no esta en la lista de expandidas y haces click, la añade a la lista y muestra sus subjurisdicciones
            updatedExpandedJurisdictions.add(jurisdiction.id);
            try {
                // Llama a la API para obtener las subjurisdicciones de la jurisdicción clicada
                const subJurisdictions = await fetchSubJurisdictions(jurisdiction.id);
                // Actualiza la jurisdicción actual con las subjurisdicciones obtenidas
                jurisdiction.subJurisdictions = subJurisdictions || [];
                // Actualiza el estado con el conjunto de jurisdicciones expandidas
                setExpandedJurisdictions(updatedExpandedJurisdictions);
                // Paro el elemento de carga
                setLoading(false);
            } catch (error) {
                // Manejo de errores en caso de que la solicitud falle
                console.error('Error fetching subjurisdictions:', error);
                // Paro el elemento de carga
                setLoading(false);
            }
        }

        // Actualiza el estado con el conjunto de jurisdicciones expandidas
        setExpandedJurisdictions(updatedExpandedJurisdictions);
    };
    // Función para manejar el cambio en el checkbox de una jurisdicción
    const handleCheckboxChange = (jurisdiction) => {
        // Crea una nueva copia del conjunto actual de jurisdicciones seleccionadas
        const updatedSelectedJurisdictions = new Set(selectedJurisdictions);
        
        // Comprueba si la jurisdicción ya está en el conjunto de seleccionadas
        if (updatedSelectedJurisdictions.has(jurisdiction.id)) {
            // Si está en updatedSelectedJurisdictions, la jurisdicción deja de estar seleccionada (delete)
            updatedSelectedJurisdictions.delete(jurisdiction.id);
        } else {
            // Si no está en updatedSelectedJurisdictions, la selecciona (add)
            updatedSelectedJurisdictions.add(jurisdiction.id);
        }
        
        // Actualiza el estado con el conjunto de jurisdicciones seleccionadas actualizado
        setSelectedJurisdictions(updatedSelectedJurisdictions);
        
        // Llama a la función handleJurisdictionClick para manejar la expansión/contracción
        // Esto mantiene el comportamiento de expansión del checkbox
        handleJurisdictionClick(jurisdiction);
    };


    // Función recursiva para renderizar jurisdicciones (funcion global)
    const renderJurisdictions = (jurisdictions) => (
        <ul className={jurisdictions.length === 2 ? 'jurisdiction-list' : 'subjurisdiction-list'}>
            {/* map itera con cada elemento de jurisdictions */}
            {jurisdictions.map((jurisdiction) => (
                <li key={jurisdiction.id}>
                    <label className={jurisdiction.id === 1 || jurisdiction.id === 2 ? 'jurisdiction-label' : 'subjurisdiction-label'}>
                        {jurisdiction.id > 200 ? ( <span></span> ) : 
                        (
                        <input
                            type="checkbox"
                            /* Marca el checkbox si selectedJurisdictions contiene el ID de la jurisdicción */
                            checked={selectedJurisdictions.has(jurisdiction.id)}
                            /* Llama a handleCheckboxChange cuando el estado del checkbox cambia, actualizando el estado y manejando la lógica de selección y expansión */
                            onChange={() => handleCheckboxChange(jurisdiction)}
                        />
                        )}
                        {jurisdiction.name}
                    </label>
                    {/* Si la jurisdiccion esta expandida y tiene subjurisdicciones */}
                    {expandedJurisdictions.has(jurisdiction.id) && jurisdiction.subJurisdictions && (
                        <div>
                            {/* Llama a renderJurisdictions recursivamente para mostrar subjurisdicciones */}
                            {renderJurisdictions(jurisdiction.subJurisdictions)}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <div className='main-jurisdictions'>
            <h1>Jurisdiction Selector</h1>
            {loading && <Loader />}
            {/* Llama a renderJurisdictions para mostrar las jurisdicciones principales */}
            {renderJurisdictions(jurisdictions)}
        </div>
    );
};

export default JurisdictionSelector;
