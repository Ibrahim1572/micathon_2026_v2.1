import { useState } from 'react'
import SubstitutionCard from './SubstitutionCard'
import './ScreenD.css'

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

function ScreenD(props) {
  var substitutions = props.substitutions || []
  var onProceed = props.onProceed

  /* Initialize all items as accepted by default */
  var [acceptedDict, setAcceptedDict] = useState(function() {
    var dict = {}
    for (var i = 0; i < substitutions.length; i++) {
      dict[substitutions[i].id] = true
    }
    return dict
  })

  function handleToggleId(id) {
    setAcceptedDict(function(prev) {
      var next = Object.assign({}, prev)
      next[id] = !next[id]
      return next
    })
  }

  function handleProceed() {
    var acceptedItems = substitutions.filter(function(item) {
      return acceptedDict[item.id]
    })
    onProceed(acceptedItems)
  }

  /* ── Derived data ── */
  var maxSavings = 0
  var currentSavings = 0
  var acceptedCount = 0

  for (var i = 0; i < substitutions.length; i++) {
    var s = substitutions[i]
    maxSavings += s.savings
    if (acceptedDict[s.id]) {
      currentSavings += s.savings
      acceptedCount++
    }
  }

  var progressPercent = maxSavings === 0 ? 0 : (currentSavings / maxSavings) * 100

  return (
    <div className="screen-d" id="screen-d">
      
      {/* ── Header ── */}
      <header className="app-header" role="banner">
        <div className="app-header__brand">
          <div className="brand-icon" aria-hidden="true">🛒</div>
          <div className="brand-text">
            <span className="brand-name">SmartSaver</span>
            <span className="brand-tagline">Imported vs. Local</span>
          </div>
        </div>
        <StepIndicator activeStep={2} />
      </header>

      <main className="screen-d__main" id="main-content">
        
        {/* ── Toolbar: Live Savings Counter ── */}
        <section className="live-savings glass-card" aria-label="Live savings calculator">
          <div className="live-savings__info">
            <h2 className="live-savings__title">Your Potential Savings</h2>
            <p className="live-savings__desc">
              Review alternatives below. Deselect items if you prefer the imported brand.
            </p>
          </div>
          <div className="live-savings__counter">
            <span className="counter-label">Total Saved:</span>
            <span className="counter-value">Rs. {currentSavings}</span>
          </div>
        </section>

        {/* ── Progress Bar ── */}
        <div className="savings-progress" role="progressbar" aria-valuenow={currentSavings} aria-valuemin={0} aria-valuemax={maxSavings}>
          <div className="savings-progress__fill" style={{ width: progressPercent + '%' }}></div>
        </div>

        {/* ── Grid of Substitution Cards ── */}
        <section className="substitutions-grid" aria-label="Substitution matches">
          {substitutions.length === 0 ? (
            <div className="empty-msg">No substitutions found for your receipt.</div>
          ) : (
            substitutions.map(function(item) {
              return (
                <SubstitutionCard 
                  key={item.id} 
                  item={item} 
                  isAccepted={acceptedDict[item.id]} 
                  onToggle={handleToggleId} 
                />
              )
            })
          )}
        </section>
      </main>

      {/* ── Footer / CTA ── */}
      <footer className="screen-d__cta" role="contentinfo">
        <p className="cta-hint">
          {acceptedCount} of {substitutions.length} local alternatives selected
        </p>
        <button 
          id="btn-confirm-plan"
          className="btn btn--cta btn--large" 
          onClick={handleProceed}
        >
          Confirm Plan & See Comparison →
        </button>
      </footer>

    </div>
  )
}

export default ScreenD
