import React from 'react'

export default function Spinner({ show }) {
  return (
    <div id="loading-overlay" className={show ? 'show' : ''} aria-hidden={!show}>
      <div className="spinner" aria-hidden={!show}></div>
    </div>
  )
}
