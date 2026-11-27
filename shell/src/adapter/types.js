/** @typedef {'common'|'rare'|'unique'|'epic'|'legend'} Tier */

/**
 * @typedef {object} AgendaItem
 * @property {string} id
 * @property {string} kind
 * @property {Tier} tier
 * @property {string} title
 * @property {string} body
 * @property {number} [pid]
 * @property {boolean} [done]
 * @property {?number} [expires] Weeks until the response is due.
 * @property {{label: string, hint?: string, lock?: boolean}[]} [choices]
 * @property {ClientCard[]} [candidates]
 * @property {{club: string, wage: ?number, years: ?number}} [terms]
 */

/**
 * @typedef {object} ClientCard
 * @property {number} id
 * @property {string} name
 * @property {string} pos
 * @property {number} age
 * @property {number} ovr
 * @property {string} club
 */

/**
 * @typedef {object} Snapshot
 * @property {string} agencyName
 * @property {string} dateLabel
 * @property {string} [nextDateLabel]
 * @property {number} week
 * @property {number} year
 * @property {number} funds
 * @property {AgendaItem[]} agenda
 * @property {AgendaItem[]} [reports]
 * @property {ClientCard[]} clients
 * @property {boolean} warnedCommon
 * @property {boolean} [saved]
 * @property {string} [notice]
 */
