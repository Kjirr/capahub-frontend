import React from 'react';

const Home = ({ navigateTo }) => (
<div className="text-center p-10 bg-base-100 text-base-content rounded-lg shadow-lg mt-10 space-y-6">
  <h2 className="text-4xl font-bold text-prntgo-primary">
    Dé Marketplace voor Drukwerk en Capaciteit
  </h2>

  <p className="text-info">
    Plaats een opdracht en ontvang offertes, of bied uw overcapaciteit aan.
  </p>

  {/* Knop gecentreerd */}
  <div className="flex justify-center">
    <button
      onClick={() => navigateTo('login')}
      className="btn-primary btn-lg flex items-center justify-center"
    >
      Begin Vandaag
    </button>
  </div>
</div>

);

export default Home;
