const SEIZOEN_TYPES = ['Voorjaarsrooster', 'Zomerrooster', 'Winterrooster']

const ANKER_SEIZOEN = 62
const ANKER_JAAR = 2026
const ANKER_TYPE_INDEX = 0 // Voorjaarsrooster

export function seizoenLabel(seizoenID) {
  if (seizoenID === null || seizoenID === undefined) return ''
  const totaalTypeIndex = ANKER_TYPE_INDEX + (seizoenID - ANKER_SEIZOEN)
  const jaar = ANKER_JAAR + Math.floor(totaalTypeIndex / 3)
  const typeIndex = ((totaalTypeIndex % 3) + 3) % 3
  return `${SEIZOEN_TYPES[typeIndex]} ${jaar}`
}

export function seizoenItems(seizoenen) {
  return seizoenen.map(s => ({ title: seizoenLabel(s), value: s }))
}
