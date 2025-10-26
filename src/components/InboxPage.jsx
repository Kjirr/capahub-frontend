// src/components/InboxPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
// --- START WIJZIGING: Importeer de store ---
import useAuthStore from '@/store/authStore';
import { getConversations, apiRequest } from '@/api';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
// --- EINDE WIJZIGING ---

// --- Iconen ---
const PaperclipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const MessageFile = ({ file }) => {
    if (file.mimetype.startsWith('image/')) {
        return <img src={file.path} alt={file.originalFilename} className="max-w-xs lg:max-w-sm rounded-lg my-2 cursor-pointer" onClick={() => window.open(file.path, '_blank')} />;
    }
    if (file.mimetype.startsWith('video/')) {
        return <video src={file.path} controls className="max-w-xs lg:max-w-sm rounded-lg my-2" />;
    }
    return (
        <a href={file.path} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 bg-base-100/50 hover:bg-base-100/80 rounded-lg my-2 max-w-xs">
            <FileIcon />
            <div className="overflow-hidden">
                <p className="font-semibold truncate">{file.originalFilename}</p>
                <p className="text-xs opacity-70">Download</p>
            </div>
        </a>
    );
};

// --- START WIJZIGING: 'currentUser' als prop verwijderd ---
const InboxPage = ({ showNotification }) => {
    // Haal de gebruiker direct uit de store
    const { currentUser } = useAuthStore();
    // --- EINDE WIJZIGING ---

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessageContent, setNewMessageContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadLimit, setUploadLimit] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const config = await apiRequest('GET', '/api/config');
                setUploadLimit(config.chatUploadLimitMb);
            } catch (error) {
                console.error("Kon de uploadlimiet niet ophalen.", error);
            }
        };
        fetchConfig();
    }, []);

    const fetchConversations = useCallback(async () => {
        setIsLoadingList(true);
        try {
            const data = await getConversations();
            setConversations(data || []);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoadingList(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectConversation = async (conversation) => {
        if (selectedConversation?.id === conversation.id) return;
        setIsLoadingMessages(true);
        setSelectedConversation(conversation);
        setShowEmojiPicker(false);
        
        try {
            const fullConversation = await apiRequest('GET', `/api/conversations/${conversation.id}`);
            setMessages(fullConversation.messages || []);
        } catch (error) {
            showNotification(error.message, 'error');
            setMessages([]);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e, fileId = null) => {
        e?.preventDefault();
        const content = newMessageContent.trim();
        if (!content && !fileId) return;

        setShowEmojiPicker(false);
        setNewMessageContent('');

        try {
            const savedMessage = await apiRequest('POST', '/api/conversations', {
                conversationId: selectedConversation.id,
                content: content || '',
                fileId: fileId,
            });
            
            setMessages(prev => [...prev, savedMessage]);
            fetchConversations();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedConversation) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const newFile = await apiRequest('POST', `/api/conversations/${selectedConversation.id}/files`, formData);
            await handleSendMessage(null, newFile.id);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessageContent(prevInput => prevInput + emojiObject.emoji);
    };

    const getOtherParticipant = (convo) => {
        if (!convo.participants || !currentUser) return null; // Extra check voor currentUser
        return convo.participants.find(p => p.id !== currentUser.id);
    };
    
    // --- START WIJZIGING: Vang het geval op dat de gebruiker nog niet geladen is ---
    if (!currentUser) {
        return <div className="p-10 text-center">Inbox laden...</div>;
    }
    // --- EINDE WIJZIGING ---

    return (
        <div className="page-container">
            <h1 className="page-title">Mijn Berichten</h1>
            <div className="card bg-base-100 shadow-xl mt-6 h-[75vh]">
                <div className="card-body grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 h-full">
                    <div className="md:col-span-1 lg:col-span-1 bg-base-200 rounded-lg p-2 overflow-y-auto h-full min-h-0">
                        {isLoadingList ? (
                            <div className="text-center p-4">Gesprekken laden...</div>
                        ) : (
                            conversations.map(convo => (
                                <div 
                                    key={convo.id} 
                                    className={`p-3 rounded-lg cursor-pointer mb-2 ${selectedConversation?.id === convo.id ? 'bg-primary text-primary-content' : 'hover:bg-base-300'}`}
                                    onClick={() => handleSelectConversation(convo)}
                                >
                                    <p className="font-bold truncate">{getOtherParticipant(convo)?.name || 'Onbekend'}</p>
                                    <p className="text-sm truncate">{convo.job.title}</p>
                                    <p className="text-xs opacity-70 truncate italic">
                                        {convo.messages[0]?.content || 'Bestandsbijlage'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 rounded-lg flex flex-col h-full min-h-0">
                        {selectedConversation ? (
                            <>
                                <div className="flex-grow p-4 overflow-y-scroll bg-base-200 rounded-t-lg min-h-0">
                                    {isLoadingMessages ? (
                                        <div className="text-center p-4">Berichten laden...</div>
                                    ) : (
                                        messages.map((msg) => (
                                            <div key={msg.id} className={`chat ${msg.sender.id === currentUser.id ? 'chat-end' : 'chat-start'}`}>
                                                <div className="chat-header text-xs opacity-50">{msg.sender.name}</div>
                                                <div className={`chat-bubble ${msg.sender.id === currentUser.id ? 'chat-bubble-primary' : ''}`}>
                                                    {msg.content}
                                                    {msg.file && <MessageFile file={msg.file} />}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                
                                <div className="relative">
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-full right-0 mb-2 z-10">
                                            <EmojiPicker 
                                                onEmojiClick={onEmojiClick}
                                                lazyLoadEmojis={true}
                                                height={350}
                                                width={300}
                                                emojiStyle={EmojiStyle.GOOGLE}
                                            />
                                        </div>
                                    )}
                                    <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300 bg-base-100 rounded-b-lg">
                                        <fieldset disabled={isLoadingMessages || isUploading} className="flex items-center gap-2">
                                            <div className="flex-grow flex items-center gap-2">
                                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                                <button type="button" title="Voeg een bestand toe" onClick={() => fileInputRef.current.click()} className="btn btn-ghost btn-circle">
                                                    {isUploading ? <span className="loading loading-spinner"></span> : <PaperclipIcon />}
                                                </button>
                                                <div className="relative w-full">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Typ een bericht..." 
                                                        className="input input-bordered w-full pr-12"
                                                        value={newMessageContent}
                                                        onChange={(e) => setNewMessageContent(e.target.value)}
                                                    />
                                                    <button 
                                                        type="button"
                                                        title="Kies een emoji"
                                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                        className="btn btn-ghost btn-sm btn-circle absolute top-1/2 right-1 -translate-y-1/2 text-xl"
                                                    >
                                                       😊
                                                    </button>
                                                </div>
                                                <button type="submit" className="btn btn-primary" disabled={!newMessageContent.trim()}>Verstuur</button>
                                            </div>
                                        </fieldset>
                                        {uploadLimit && (
                                            <p className="text-xs text-base-content/50 text-right mt-1 pr-16">
                                                Max. bestandsgrootte: {uploadLimit} MB
                                            </p>
                                        )}
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-base-200 rounded-lg">
                                <p className="text-base-content/60">Selecteer een gesprek om de berichten te zien.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InboxPage;