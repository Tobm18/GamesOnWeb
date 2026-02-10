import React from 'react';

const StartScreen = ({ title, subtitle, controls, objectives, onStart }) => {
    return (
        <div className="game-ui-overlay">
            <div className="modal-card">
                <h1>{title}</h1>
                {subtitle && <p className="subtitle">{subtitle}</p>}
                
                <div className="controls-section">
                    <h3>Contrôles</h3>
                    {controls.map((control, index) => (
                        <div key={index} className="control-item">
                            {control.keys.map((key, kIndex) => (
                                <React.Fragment key={kIndex}>
                                    <span className="key">{key}</span>
                                    {kIndex < control.keys.length - 1 && ' ou '}
                                </React.Fragment>
                            ))}
                            <span className="control-desc">{control.description}</span>
                        </div>
                    ))}
                </div>
                
                <div className="objectives-section">
                    <h3>Objectifs</h3>
                    <ul>
                        {objectives.map((objective, index) => (
                            <li key={index}>{objective}</li>
                        ))}
                    </ul>
                </div>
                
                <div className="card-actions">
                    <button onClick={onStart} className="start-btn">Commencer</button>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;
