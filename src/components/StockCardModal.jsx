import React, { useState, useEffect, useCallback } from 'react';
// GEWIJZIGD: Importeer de nieuwe, specifieke functie in plaats van de algemene.
import { getStockHistory } from '../api';

const StockCardModal = ({ isOpen, onClose, showNotification, stockItem, onCorrectStock, onMoveStock }) => {
    const [movements, setMovements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMovements = useCallback(async () => {
        if (!stockItem) return;
        setIsLoading(true);
        try {
            const { material, location } = stockItem;
            // GEWIJZIGD: Gebruik de nieuwe, veilige functie met de juiste argumenten.
            const data = await getStockHistory(material.id, location.id);
            setMovements(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [stockItem, showNotification]);

    useEffect(() => {
        if (isOpen) {
            fetchMovements();
        }
    }, [isOpen, fetchMovements]);
    
    const handleCorrectStockClick = () => {
        onCorrectStock();
        onClose();
    };

    const handleMoveStockClick = () => {
        onMoveStock(); // Vertelt de hoofdpagina om de verplaats-modal te openen
        onClose();
    };

    const getChangeColor = (change) => {
        if (change > 0) return 'text-success';
        if (change < 0) return 'text-error';
        return 'text-base-content/60';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="card bg-base-100 shadow-xl w-full max-w-4xl">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="card-title-lg">Voorraadkaart</h2>
                            <p className="page-subtitle">Historie voor <strong>{stockItem?.material.name}</strong> op locatie <strong>{stockItem?.location.name}</strong></p>
                        </div>
                        <button type="button" onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
                    </div>
                    
                    <div className="mt-4 max-h-[60vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="text-center p-8"><span className="loading loading-spinner"></span></div>
                        ) : (
                            <table className="table table-sm w-full">
                                <thead>
                                    <tr>
                                        <th>Datum</th>
                                        <th>Type</th>
                                        <th>Verandering</th>
                                        <th>Nieuw Totaal</th>
                                        <th>Reden</th>
                                        <th>Gebruiker</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.length > 0 ? movements.map(move => (
                                        <tr key={move.id} className="hover">
                                            <td>{new Date(move.createdAt).toLocaleString()}</td>
                                            <td><span className="badge badge-ghost badge-sm">{move.type}</span></td>
                                            <td className={`font-mono font-bold ${getChangeColor(move.changeQuantity)}`}>
                                                {move.changeQuantity > 0 ? '+' : ''}{move.changeQuantity}
                                            </td>
                                            <td className="font-bold">{move.newQuantity}</td>
                                            <td>{move.reason}</td>
                                            <td>{move.user?.name || 'Systeem'}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="text-center">Geen historie gevonden voor dit item.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="card-actions justify-end mt-6 space-x-2">
                        <button type="button" onClick={handleMoveStockClick} className="btn btn-outline">Voorraad Verplaatsen</button>
                        <button type="button" onClick={handleCorrectStockClick} className="btn btn-outline">Voorraad Corrigeren</button>
                        <button type="button" onClick={onClose} className="btn">Sluiten</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockCardModal;