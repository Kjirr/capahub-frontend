// src/components/ConversationModal.jsx

import React, { useState, useRef, useEffect } from 'react';

const ConversationModal = ({ isOpen, onClose, conversation, onSendMessage, currentUser, isSending }) => {
    const [content, setContent] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, conversation?.messages]);

    if (!isOpen || !conversation) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (content.trim()) {
            onSendMessage(content);
            setContent('');
        }
    };

    const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);

    // --- DE FIX ZIT HIER ---
    // De 'onClick' zit nu op de buitenste div. De losse 'modal-backdrop' is verwijderd.
    return (
        <div className="modal modal-open" onClick={onClose}>
            {/* e.stopPropagation() voorkomt dat een klik in de box de modal sluit */}
            <div 
                className="modal-box w-11/12 max-w-2xl flex flex-col h-[70vh]" 
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h3 className="font-bold text-lg mb-4">Gesprek met {otherParticipant?.name || '...'}</h3>
                
                {/* Berichten venster */}
                <div className="flex-grow bg-base-200 rounded-lg p-4 overflow-y-auto mb-4">
                    {conversation.messages && conversation.messages.length > 0 ? (
                        conversation.messages.map(msg => (
                            <div key={msg.id} className={`chat ${msg.senderId === currentUser.id ? 'chat-end' : 'chat-start'}`}>
                                <div className="chat-header text-xs opacity-50">
                                    {msg.sender.name}
                                </div>
                                <div className={`chat-bubble ${msg.senderId === currentUser.id ? 'chat-bubble-primary' : ''}`}>
                                    {msg.content}
                                </div>
                                <div className="chat-footer opacity-50 text-xs">
                                    {new Date(msg.createdAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-base-content/60 h-full flex items-center justify-center">
                            <p>Stel de eerste vraag over deze opdracht.</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Invoerveld */}
                <form onSubmit={handleFormSubmit}>
                    <div className="form-control">
                        <textarea
                            className="textarea textarea-bordered w-full"
                            rows="3"
                            placeholder="Typ je bericht..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={isSending}
                        ></textarea>
                        <button type="submit" className="btn btn-primary mt-2" disabled={isSending || !content.trim()}>
                            {isSending ? <span className="loading loading-spinner"></span> : 'Verstuur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConversationModal;