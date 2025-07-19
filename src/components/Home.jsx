import React from 'react';

const Home = ({ navigateTo }) => (
    <div className="text-center p-10 bg-white rounded-lg shadow-lg mt-10">
        <h2 className="text-4xl font-bold mb-4">Dé Marketplace voor Drukwerk en Capaciteit</h2>
        <p className="text-gray-600 mb-8">Plaats een opdracht en ontvang offertes, of bied uw overcapaciteit aan.</p>
        <button onClick={() => navigateTo('login')} className="btn btn-primary btn-lg">Begin Vandaag</button>
    </div>
);

export default Home;