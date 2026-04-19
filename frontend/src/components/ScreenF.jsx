import { useState, useEffect } from 'react'
import { calculateSurplus } from '../lib/api'
import './ScreenF.css'

/* ── Step indicator data ── */
var STEPS = [
  { id: 1, label: 'Enter Receipt' },
  { id: 2, label: 'Smart Plan'   },
  { id: 3, label: 'Comparison'   },
]

function StepIndicator(props) {
  var active = props.activeStep
  return (
    <nav className="step-indicator" aria-label="Progress steps">
      {STEPS.map(function(step) {
        var isCurrent  = step.id === active
        var isComplete = step.id < active
        return (
          <div
            key={step.id}
            className={'step' + (isCurrent ? ' step--active' : '') + (isComplete ? ' step--done' : '')}
          >
            <div className="step__dot">
              {isComplete ? '✓' : step.id}
            </div>
            <span className="step__label">{step.label}</span>
            {step.id < STEPS.length && <div className="step__line" />}
          </div>
        )
      })}
    </nav>
  )
}

/* ── Static Extras Catalog ── */
var EXTRAS_CATALOG = [
  { name: 'Kashmiri Apple (1kg)', price: 180, emoji: '🍎' },
  { name: 'National Ketchup (800g)', price: 320, emoji: '🍅' },
  { name: 'Dawn Bread (Large)', price: 150, emoji: '🍞' },
  { name: 'Olpers Milk (1L)', price: 280, emoji: '🥛' },
  { name: 'Tapal Danedar (200g)', price: 400, emoji: '☕' }
]

function getBonusItems(surplusAmount) {
  var options = []
  for (var i = 0; i < EXTRAS_CATALOG.length; i++) {
    var item = EXTRAS_CATALOG[i]
    var qty = Math.floor(surplusAmount / item.price)
    if (qty > 0) {
      options.push({
        name: item.name,
        emoji: item.emoji,
        quantity: qty,
        unitPrice: item.price,
        total: qty * item.price
      })
    }
  }
  options.sort(function(a, b) { return b.quantity - a.quantity })
  return options
}

/* ── Main Component ── */
function ScreenF(props) {
  var finalSubs = props.finalSubs || []
  var onRestart = props.onRestart

  var [surplusData, setSurplusData] = useState(null)
  var [loading, setLoading] = useState(true)
  var [error, setError] = useState(null)

  useEffect(function() {
    calculateSurplus(finalSubs)
      .then(function(data) {
        setSurplusData(data)
        setLoading(false)
      })
      .catch(function() {
        setError('Failed to calculate exact surplus.')
        setLoading(false)
      })
  }, [finalSubs])

  if (loading) {
    return (
      <div className="screen-f__loading">
        <span className="spinner spinner--dark" style={{ width: 40, height: 40 }} />
        <p>Calculating your final basket...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="screen-f__loading">
        <p style={{ color: 'var(--text-primary)' }}>⚠ {error}</p>
        <button className="btn btn--secondary mt-4" onClick={onRestart}>Start Over</button>
      </div>
    )
  }

  var originalTotal = surplusData.original_total
  var newTotal      = surplusData.new_total
  var surplus       = surplusData.surplus

  var extraOptions = getBonusItems(surplus)

  return (
    <div className="screen-f">
      
      {/* ── Header ── */}
      <header className="app-header" role="banner">
        <div className="app-header__brand">
          <div className="brand-icon" aria-hidden="true">🛒</div>
          <div className="brand-text">
            <span className="brand-name">SmartSaver</span>
            <span className="brand-tagline">Imported vs. Local</span>
          </div>
        </div>
        <StepIndicator activeStep={3} />
      </header>

      {/* ── Hero Success ── */}
      <section className="screen-f__hero">
        <h1 className="hero-title">Your Master Plan is Ready 🎉</h1>
        <p className="hero-sub">
          By switching to local brands, you've unlocked <strong>Rs. {surplus}</strong> in surplus value!
        </p>
      </section>

      {/* ── Side by Side Layout ── */}
      <main className="comparison-layout">
        
        {/* Left: Original Basket */}
        <section className="basket-card glass-card basket-card--original">
          <div className="basket-card__header">
            <h3>Original Basket</h3>
            <span className="basket-total">Rs. {originalTotal}</span>
          </div>
          
          <ul className="basket-list">
            {finalSubs.map(function(sub) {
              return (
                <li key={'orig-' + sub.id} className="basket-item basket-item--faded">
                  <span className="basket-item__name">{sub.imported_name}</span>
                  <span className="basket-item__price">Rs. {sub.imported_price}</span>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Right: New Basket */}
        <section className="basket-card glass-card basket-card--new">
          <div className="basket-card__header">
            <h3>Smart Basket</h3>
            <span className="basket-total basket-total--success">Rs. {newTotal}</span>
          </div>
          
          <ul className="basket-list">
            {finalSubs.map(function(sub) {
              return (
                <li key={'new-' + sub.id} className="basket-item">
                  <span className="basket-item__indicator">✅</span>
                  <span className="basket-item__name">{sub.local_name}</span>
                  <span className="basket-item__price">Rs. {sub.local_price}</span>
                </li>
              )
            })}
          </ul>
               
          {/* Extras logic */}
          {surplus > 0 && (
            <div className="extras-section">
              <div className="extras-section__header">
                <h4>✨ Plus you can now afford...</h4>
                <span className="extras-surplus">Rs. {surplus} Surplus</span>
              </div>
              
              <div className="extras-options">
                {extraOptions.length > 0 ? extraOptions.map(function(opt, i) {
                  return (
                    <div key={i} className="extra-option">
                      <div className="extra-option__info">
                        <span className="extra-emoji">{opt.emoji}</span>
                        <div className="extra-text">
                          <span className="extra-qty">{opt.quantity}x</span>
                          <span className="extra-name">{opt.name}</span>
                        </div>
                      </div>
                      <span className="extra-total">Rs. {opt.total}</span>
                    </div>
                  )
                }) : (
                  <p className="extra-option--none">You've saved money, though not quite enough for our bonus items.</p>
                )}
              </div>
            </div>
          )}
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="screen-f__cta">
        <button className="btn btn--secondary" onClick={onRestart}>
          Start Another Receipt ↺
        </button>
      </footer>

    </div>
  )
}

export default ScreenF
