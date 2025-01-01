// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './App.css'; // Ensure this line is present to include your CSS

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', python);

function App() {
    const [endpoint, setEndpoint] = useState('');
    const [method, setMethod] = useState('GET');
    const [params, setParams] = useState([{ name: '', type: 'string' }]);
    const [language, setLanguage] = useState('JavaScript');
    const [generatedCode, setGeneratedCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleParamChange = (index, field, value) => {
        const newParams = [...params];
        newParams[index][field] = value;
        setParams(newParams);
    };

    const addParam = () => {
        setParams([...params, { name: '', type: 'string' }]);
    };

    const removeParam = (index) => {
        const newParams = params.filter((_, i) => i !== index);
        setParams(newParams);
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setGeneratedCode('');

        // Filter out empty parameter names
        const filteredParams = params.filter(p => p.name.trim() !== '');

        try {
            const response = await axios.post('/generate-code', {
                endpoint,
                method,
                params: filteredParams,
                language
            });
            setGeneratedCode(response.data.code);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([generatedCode], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `api_integration.${language === 'JavaScript' ? 'js' : 'py'}`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };

    return (
        <div className="container">
            <h1 className="title">API Integration Code Generator Demo</h1>
            
            <div className="form-section">
                <div className="form-group">
                    <label>API Endpoint:</label>
                    <input
                        type="text"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        placeholder="https://api.example.com/v1/data"
                        className="input-field"
                    />
                </div>

                <div className="form-group">
                    <label>HTTP Method:</label>
                    <select value={method} onChange={(e) => setMethod(e.target.value)} className="select-field">
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Parameters:</label>
                    {params.map((param, index) => (
                        <div key={index} className="param-row">
                            <input
                                type="text"
                                placeholder="Name"
                                value={param.name}
                                onChange={(e) => handleParamChange(index, 'name', e.target.value)}
                                className="input-field param-input"
                            />
                            <select
                                value={param.type}
                                onChange={(e) => handleParamChange(index, 'type', e.target.value)}
                                className="select-field param-select"
                            >
                                <option>string</option>
                                <option>number</option>
                                <option>boolean</option>
                            </select>
                            <button onClick={() => removeParam(index)} className="remove-btn">Remove</button>
                        </div>
                    ))}
                    <button onClick={addParam} className="add-btn">Add Parameter</button>
                </div>

                <div className="form-group">
                    <label>Language:</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="select-field">
                        <option>JavaScript</option>
                        <option>Python</option>
                    </select>
                </div>

                <button onClick={handleGenerate} className="generate-btn" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Code'}
                </button>

                {error && <div className="error-message">{error}</div>}
            </div>

            {generatedCode && (
                <div className="code-section">
                    <h2>Generated Code:</h2>
                    <SyntaxHighlighter language={language.toLowerCase()} style={docco}>
                        {generatedCode}
                    </SyntaxHighlighter>
                    <div className="download-section">
                        <button onClick={handleDownload} className="download-btn">
                            Download Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;