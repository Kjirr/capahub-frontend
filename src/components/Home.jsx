import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        // --- START WIJZIGING: De pagina is nu een 'Hero' component ---
        <div className="hero min-h-[70vh] bg-base-200 rounded-lg">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold text-base-content">
                        Het platform voor Drukwerk en Capaciteit
                    </h1>
                    <p className="py-6 text-lg">
                        Plaats een opdracht en ontvang offertes, of bied uw overcapaciteit aan op de marktplaats.
                    </p>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="btn btn-primary btn-lg"
                    >
                        Begin Vandaag
                    </button>
                </div>
            </div>
        </div>
        // --- EINDE WIJZIGING ---
    );
};

export default Home;