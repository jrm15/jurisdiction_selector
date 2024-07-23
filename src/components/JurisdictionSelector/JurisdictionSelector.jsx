import React, { useEffect, useState } from 'react';
import { fetchJurisdictions, fetchSubJurisdictions } from '../../utils/api';
import './JurisdictionSelector.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const JurisdictionSelector = () => {
    const [jurisdictions, setJurisdictions] = useState([]);

    const [expandedJurisdictions, setExpandedJurisdictions] = useState(new Set());

    const [selectedJurisdictions, setSelectedJurisdictions] = useState(new Set());

    const [loading, setLoading] = useState(false)

    const Loader = () => (
        <LoadingSpinner />
    )

    useEffect(() => {
        loadJurisdictions();
    }, []);

    const loadJurisdictions = async () => {
        setLoading(true);
        try {
            const data = await fetchJurisdictions();
            setJurisdictions(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jurisdictions:', error);
            setLoading(false);
        }
    }

    const handleJurisdictionClick = async (jurisdiction) => {
        const updatedExpandedJurisdictions = new Set(expandedJurisdictions);
        setLoading(true);

        if (expandedJurisdictions.has(jurisdiction.id)) {
            updatedExpandedJurisdictions.delete(jurisdiction.id);
            setLoading(false);
        } else {
            updatedExpandedJurisdictions.add(jurisdiction.id);
            try {
                const subJurisdictions = await fetchSubJurisdictions(jurisdiction.id);
                jurisdiction.subJurisdictions = subJurisdictions || [];
                setExpandedJurisdictions(updatedExpandedJurisdictions);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching subjurisdictions:', error);
                setLoading(false);
            }
        }
        setExpandedJurisdictions(updatedExpandedJurisdictions);
    };

    const handleCheckboxChange = (jurisdiction) => {
        const updatedSelectedJurisdictions = new Set(selectedJurisdictions);
        
        if (updatedSelectedJurisdictions.has(jurisdiction.id)) {
            updatedSelectedJurisdictions.delete(jurisdiction.id);
        } else {
            updatedSelectedJurisdictions.add(jurisdiction.id);
        }
        setSelectedJurisdictions(updatedSelectedJurisdictions);
        handleJurisdictionClick(jurisdiction);
    };

    const renderJurisdictions = (jurisdictions) => (
        <ul className={jurisdictions.length === 2 ? 'jurisdiction-list' : 'subjurisdiction-list'}>
            {jurisdictions.map((jurisdiction) => (
                <li key={jurisdiction.id}>
                    <label className={jurisdiction.id === 1 || jurisdiction.id === 2 ? 'jurisdiction-label' : 'subjurisdiction-label'}>
                        {jurisdiction.id > 200 ? ( <span></span> ) : 
                        (
                        <input
                            type="checkbox"
                            checked={selectedJurisdictions.has(jurisdiction.id)}
                            onChange={() => handleCheckboxChange(jurisdiction)}
                        />
                        )}
                        {jurisdiction.name}
                    </label>
                    {expandedJurisdictions.has(jurisdiction.id) && jurisdiction.subJurisdictions && (
                        <div>
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
            {renderJurisdictions(jurisdictions)}
        </div>
    );
};

export default JurisdictionSelector;
