import React from 'react';

const GameOver = ({ score, message, onRestart }) => {
    return (
        <div className="game-ui-overlay">
            <div className="modal-card">
                <h2>Game Over</h2>
                {message && <p className="survival-message">{message}</p>}
                <div className="stats-container">
                    <p className="final-score">Score Final: <span>{score}</span> pts</p>
                </div>
                <div className="card-actions">
                    <button onClick={onRestart} className="restart-btn">Rejouer</button>
                </div>
            </div>
        </div>
    );
};

export default GameOver;
