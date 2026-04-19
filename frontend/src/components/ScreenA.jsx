import { useState } from 'react'
import DonutChart, { getColor } from './DonutChart'
import { uploadReceipt, parseReceipt, getSubstitutions } from '../lib/api'
import './ScreenA.css'

/* ── Step indicator data ── */
var STEPS = [
  { id: 1, label: 'Enter Receipt' },
  { id: 2, label: 'Smart Plan'   },
  { id: 3, label: 'Comparison'   },
]

/* ── Helpers ── */

/** Flatten { category: [items] } into a single array of strings */
function flattenItems(categories) {
  var all = []
  var keys = Object.keys(categories)
  for (var i = 0; i < keys.length; i++) {
    var items = categories[keys[i]]
    for (var j = 0; j < items.length; j++) {
      all.push(items[j])
    }
  }
  return all
}

/** Convert API categories map to Recharts-compatible chart data array */
function buildChartData(categories) {
  var keys = Object.keys(categories)
  var data = []
  for (var i = 0; i < keys.length; i++) {
    var name  = keys[i]
    var count = categories[name].length
    if (count > 0) {
      data.push({ name: name, value: count, color: getColor(name) })
    }
  }
  return data
}

/* ── Sub-components ── */

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

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <circle cx="32" cy="32" r="18" stroke="rgba(0,229,160,0.20)" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="32" cy="32" r="8"  fill="rgba(0,229,160,0.12)" />
          <circle cx="32" cy="32" r="4"  fill="rgba(0,229,160,0.30)" />
        </svg>
      </div>
      <p className="empty-state__title">Your analysis will appear here</p>
      <p className="empty-state__sub">Enter your receipt and click <strong>Analyze</strong> to see a spending breakdown by category.</p>
    </div>
  )
}

function CategoryLegend(props) {
  var data = props.data

  function renderItem(entry) {
    return (
      <div key={entry.name} className="legend-item">
        <span className="legend-item__dot" style={{ background: entry.color }} />
        <span className="legend-item__name">{entry.name}</span>
        <span className="legend-item__count">{entry.value}</span>
      </div>
    )
  }

  return (
    <div className="legend">
      {data.map(renderItem)}
    </div>
  )
}

/* ── Main ScreenA Component ── */
function ScreenA(props) {
  var onProceed = props.onProceed

  var [receiptText,    setReceiptText]    = useState('')
  var [categories,     setCategories]     = useState(null)
  var [chartData,      setChartData]      = useState([])
  var [loadingState,   setLoadingState]   = useState(null)  /* null | 'sample' | 'analyze' | 'proceed' */
  var [error,          setError]          = useState(null)

  /* ── Event Handlers (no arrow functions) ── */

  function handleReceiptChange(e) {
    setReceiptText(e.target.value)
    if (error) setError(null)
  }

  function handleFileUpload(e) {
    var file = e.target.files[0]
    if (!file) return

    setLoadingState('sample')
    setError(null)
    uploadReceipt(file)
      .then(function(data) {
        setReceiptText(data.receipt_text)
        setCategories(null)
        setChartData([])
        setLoadingState(null)
      })
      .catch(function() {
        setError('Could not extract text. Ensure backend is running and API key is valid.')
        setLoadingState(null)
      })
  }

  function handleAnalyze() {
    if (!receiptText.trim()) {
      setError('Please enter receipt text or use Load Sample first.')
      return
    }
    setLoadingState('analyze')
    setError(null)
    parseReceipt(receiptText)
      .then(function(data) {
        var cats = data.categories
        setCategories(cats)
        setChartData(buildChartData(cats))
        setLoadingState(null)
      })
      .catch(function() {
        setError('Analysis failed. Please check that the backend is running.')
        setLoadingState(null)
      })
  }

  function handleFindSubstitutes() {
    if (!categories) return
    setLoadingState('proceed')
    setError(null)
    var items = flattenItems(categories)
    getSubstitutions(items)
      .then(function(data) {
        setLoadingState(null)
        onProceed(data.substitutions, categories)
      })
      .catch(function() {
        setError('Could not fetch substitutions. Please try again.')
        setLoadingState(null)
      })
  }

  /* ── Derived values ── */
  var lineCount       = receiptText.trim() ? receiptText.trim().split('\n').filter(function(l) { return l.trim() }).length : 0
  var isLoadingSample = loadingState === 'sample'
  var isAnalyzing     = loadingState === 'analyze'
  var isProceeding    = loadingState === 'proceed'
  var hasResults      = categories !== null && chartData.length > 0

  /* ── Render ── */
  return (
    <div className="screen-a" id="screen-a">

      {/* ── Header ── */}
      <header className="app-header" role="banner">
        <div className="app-header__brand">
          <div className="brand-icon" aria-hidden="true">🛒</div>
          <div className="brand-text">
            <span className="brand-name">SmartSaver</span>
            <span className="brand-tagline">Imported vs. Local</span>
          </div>
        </div>
        <StepIndicator activeStep={1} />
      </header>

      {/* ── Hero ── */}
      <section className="screen-a__hero" aria-labelledby="hero-heading">
        <h1 id="hero-heading" className="hero-title">
          Smarter Grocery Shopping{' '}
          <span className="hero-title--accent">Starts Here</span>
        </h1>
        <p className="hero-sub">
          Paste your Naheed receipt below — we'll map every imported item to a
          quality local alternative and show you <strong>exactly</strong> how much you save.
        </p>
      </section>

      {/* ── Main Columns ── */}
      <main className="screen-a__columns" id="main-content">

        {/* ── Left: Receipt Input Panel ── */}
        <section className="panel glass-card panel--input" aria-label="Receipt input">
          <div className="panel__header">
            <div className="panel__header-left">
              <span className="panel__icon" aria-hidden="true">📄</span>
              <h2 className="panel__title">Your Receipt</h2>
            </div>
            {lineCount > 0 && (
              <span className="badge">{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
            )}
          </div>

          <textarea
            id="receipt-input"
            className="receipt-textarea"
            value={receiptText}
            onChange={handleReceiptChange}
            placeholder={'Paste your grocery receipt here...\n\nExample:\nLurpak Butter 200g...........Rs. 680\nBarilla Pasta 500g...........Rs. 650\nPringles Original 165g.......Rs. 680'}
            aria-label="Receipt text input"
            spellCheck={false}
          />

          <div className="panel__actions">
            <label
              id="btn-upload-receipt"
              className={"btn btn--secondary" + (loadingState !== null ? " disabled" : "")}
              htmlFor="receipt-upload"
            >
              {isLoadingSample
                ? <><span className="spinner spinner--dark" /> Extracting...</>
                : '📷 Upload Receipt'
              }
            </label>
            <input
              type="file"
              id="receipt-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              disabled={loadingState !== null}
            />

            <button
              id="btn-analyze"
              className="btn btn--primary"
              onClick={handleAnalyze}
              disabled={loadingState !== null || !receiptText.trim()}
              aria-busy={isAnalyzing}
            >
              {isAnalyzing
                ? <><span className="spinner" /> Analyzing...</>
                : '⚡  Analyze Receipt'
              }
            </button>
          </div>

          {error && (
            <div className="error-msg" role="alert">
              ⚠ {error}
            </div>
          )}
        </section>

        {/* ── Right: Analysis Results Panel ── */}
        <section
          className={'panel glass-card panel--results' + (hasResults ? ' panel--has-results' : '')}
          aria-label="Spending analysis"
          aria-live="polite"
        >
          <div className="panel__header">
            <div className="panel__header-left">
              <span className="panel__icon" aria-hidden="true">📊</span>
              <h2 className="panel__title">Spend Analysis</h2>
            </div>
            {hasResults && (
              <span className="badge">
                {chartData.reduce(function(acc, d) { return acc + d.value }, 0)} items
              </span>
            )}
          </div>

          {hasResults ? (
            <div className="results-content">
              <DonutChart data={chartData} />
              <CategoryLegend data={chartData} />
            </div>
          ) : (
            <EmptyState />
          )}
        </section>

      </main>

      {/* ── CTA to Screen D ── */}
      {hasResults && (
        <footer className="screen-a__cta" role="contentinfo">
          <p className="cta-hint">
            Found <strong>{chartData.reduce(function(acc, d) { return acc + d.value }, 0)}</strong> items
            across <strong>{chartData.length}</strong> categories
          </p>
          <button
            id="btn-find-substitutes"
            className="btn btn--cta"
            onClick={handleFindSubstitutes}
            disabled={isProceeding}
            aria-busy={isProceeding}
          >
            {isProceeding
              ? <><span className="spinner" /> Finding alternatives...</>
              : 'Find Local Substitutes →'
            }
          </button>
        </footer>
      )}

    </div>
  )
}

export default ScreenA
