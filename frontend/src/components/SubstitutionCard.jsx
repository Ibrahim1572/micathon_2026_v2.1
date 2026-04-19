import { getCategoryColor } from '../lib/colors'

/*
  SubstitutionCard displays the comparison between an imported item
  and its local alternative. The user can toggle it on/off.
*/
function SubstitutionCard(props) {
  var item = props.item
  var isAccepted = props.isAccepted
  var onToggle = props.onToggle

  var color = getCategoryColor(item.category)

  function handleToggle() {
    onToggle(item.id)
  }

  return (
    <div className={'sub-card glass-card' + (isAccepted ? ' sub-card--active' : ' sub-card--inactive')}>
      
      {/* ── Header ── */}
      <div className="sub-card__header">
        <span 
          className="badge" 
          style={{ borderColor: color, color: color, background: color + '20' }}
        >
          {item.category}
        </span>
        
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            className="toggle-switch__input"
            checked={isAccepted}
            onChange={handleToggle}
            aria-label={'Accept substitution for ' + item.imported_name}
          />
          <span className="toggle-switch__slider"></span>
        </label>
      </div>

      {/* ── Content: Side-by-side comparison ── */}
      <div className="sub-card__comparison">
        
        <div className="item-details item-details--imported">
          <span className="item-label">Imported</span>
          <h4 className="item-name">{item.imported_name}</h4>
          <span className="item-price">Rs. {item.imported_price}</span>
        </div>

        <div className="comparison-arrow">
          <span aria-hidden="true">→</span>
        </div>

        <div className="item-details item-details--local">
          <span className="item-label" style={{ color: 'var(--primary)' }}>Local Alternative</span>
          <h4 className="item-name">{item.local_name}</h4>
          <span className="item-price" style={{ color: 'var(--primary)' }}>Rs. {item.local_price}</span>
        </div>

      </div>

      {/* ── Footer: Savings ── */}
      <div className="sub-card__footer">
        <span className="savings-label">You save</span>
        <span className="savings-amount">Rs. {item.savings}</span>
      </div>

    </div>
  )
}

export default SubstitutionCard
