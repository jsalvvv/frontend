// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './App.css'; // Tailwind CSS

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', python);

function App() {
    const [fieldCount, setFieldCount] = useState(1);
    const [fields, setFields] = useState([{ type: 'text', name: '' }]);
    const [apiToken, setApiToken] = useState('');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [apiResponse, setApiResponse] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [showGeneratedForm, setShowGeneratedForm] = useState(false);
    const [showApiResponse, setShowApiResponse] = useState(false);
    const [showGeneratedCode, setShowGeneratedCode] = useState(false);

    const addField = () => {
        setFields([...fields, { type: 'text', name: '' }]);
        setFieldCount(fieldCount + 1);
    };

    const removeField = (index) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    };

    const handleFieldChange = (index, field, value) => {
        const newFields = [...fields];
        newFields[index][field] = value;
        setFields(newFields);
    };

    const handleGenerateForm = () => {
        setShowGeneratedForm(true);
        setShowApiResponse(true);
        setShowGeneratedCode(true);
        let formHTML = '<form id="dynamicForm">';
        fields.forEach((field, index) => {
            if (field.type === 'select') {
                formHTML += `<label for="${field.name}">${field.name}:</label><select id="${field.name}" name="${field.name}" required>`;
                // Add options logic here
                formHTML += '</select>';
            } else {
                formHTML += `<label for="${field.name}">${field.name}:</label><input type="${field.type}" id="${field.name}" name="${field.name}" required>`;
            }
        });
        formHTML += '<button type="submit">Submit</button></form>';
        document.getElementById('generatedForm').innerHTML = formHTML;

        // Handle dynamic form submission
        document.getElementById('dynamicForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiToken
                },
                body: JSON.stringify({
                    userId: userId,
                    password: password,
                    ...data
                })
            })
            .then(response => response.json())
            .then(data => {
                setApiResponse(JSON.stringify(data, null, 2));
                const code = `
                    fetch('${endpoint}', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ${apiToken}'
                        },
                        body: JSON.stringify({
                            userId: '${userId}',
                            password: '${password}',
                            ${Object.keys(data).map(key => `${key}: '${data[key]}'`).join(',\n')}
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('API Response:', data);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                `;
                setGeneratedCode(code);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-gray-300 to-gray-100 rounded-lg shadow-lg mt-12 border border-black">
            <h1 className="text-3xl font-bold text-black mb-8 text-center">API Integration Form Builder</h1>

            <div className="bg-gray-200 p-4 rounded-md mb-8">
                <h2 className="text-xl font-semibold text-black mb-2">Important Security Notice</h2>
                <p className="text-gray-700">Please do not store your API tokens, user IDs, or passwords directly in the front-end code. Use environment variables or a secure server to manage sensitive information.</p>
            </div>

            <div className="bg-white p-4 rounded-md mb-8">
                <h2 className="text-xl font-semibold text-black mb-4">Add Input Fields</h2>
                <div id="fieldList">
                    {fields.map((field, index) => (
                        <div key={index} className="field-container">
                            <label htmlFor={`field${index}`}>Field {index + 1}:</label>
                            <select value={field.type} onChange={(e) => handleFieldChange(index, 'type', e.target.value)}>
                                <option value="text">Text</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="select">Select</option>
                            </select>
                            <input type="text" value={field.name} onChange={(e) => handleFieldChange(index, 'name', e.target.value)} placeholder="Field Name" required />
                            <button type="button" onClick={() => removeField(index)}>Remove Field</button>
                        </div>
                    ))}
                </div>
                <button onClick={addField}>Add Field</button>
            </div>

            <div className="bg-white p-4 rounded-md mb-8">
                <h2 className="text-xl font-semibold text-black mb-4">API Credentials</h2>
                <label htmlFor="apiToken">API Token:</label>
                <input type="text" id="apiToken" value={apiToken} onChange={(e) => setApiToken(e.target.value)} placeholder="Enter API token" required />

                <label htmlFor="userId">User ID:</label>
                <input type="text" id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter user ID" required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />

                <label htmlFor="endpoint">API Endpoint:</label>
                <input type="text" id="endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="Enter API endpoint" required />

                <button onClick={handleGenerateForm}>Generate Form</button>
            </div>

            {showGeneratedForm && (
                <div>
                    <h2 className="text-xl font-semibold text-black mb-4">Generated Form:</h2>
                    <div id="generatedForm"></div>
                </div>
            )}

            {showApiResponse && (
                <div>
                    <h2 className="text-xl font-semibold text-black mb-4">API Response:</h2>
                    <pre id="apiResponse">{apiResponse}</pre>
                </div>
            )}

            {showGeneratedCode && (
                <div>
                    <h2 className="text-xl font-semibold text-black mb-4">Generated Code:</h2>
                    <pre id="generatedCode">{generatedCode}</pre>
                </div>
            )}
        </div>
    );
}

export default App;