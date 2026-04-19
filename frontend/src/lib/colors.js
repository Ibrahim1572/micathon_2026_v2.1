/*
  Shared category colour map.
  Single source of truth — imported by DonutChart, SubstitutionCard, ScreenD.
*/

var CATEGORY_COLORS = {
  Dairy:     '#FFD166',
  Produce:   '#06D6A0',
  Grains:    '#FF8C42',
  Protein:   '#EF476F',
  Snacks:    '#A855F7',
  Beverages: '#00B4D8',
  Other:     '#64748B',
}

function getCategoryColor(name) {
  return CATEGORY_COLORS[name] || CATEGORY_COLORS.Other
}

export { CATEGORY_COLORS, getCategoryColor }
