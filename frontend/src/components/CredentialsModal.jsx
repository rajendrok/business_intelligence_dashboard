// src/components/CredentialsModal.js
import React, { useState } from "react";

function CredentialsModal({ isOpen, onSubmit, onClose }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [host, setHost] = useState('');
    const [port, setPort] = useState('');
    const [database, setDatabase] = useState('');

    if (!isOpen) return null;

    return (
        <div style={{ border: '1px solid black', padding: '20px', background: 'lightgrey' }}>
            <h2>Enter Database Credentials</h2>
            <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} /><br />
            <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} /><br />
            <input placeholder="Host" onChange={(e) => setHost(e.target.value)} /><br />
            <input placeholder="Port" type="number" onChange={(e) => setPort(e.target.value)} /><br />
            <input placeholder="Database" onChange={(e) => setDatabase(e.target.value)} /><br />
            <br />
            <button onClick={() => onSubmit({ username, password, host, port, database })}>
                Submit
            </button>
            <button onClick={onClose}>
                Cancel
            </button>
        </div>
    )
}

export default CredentialsModal;
