# Design Critique

- **Blocker — No alternatives.** Explain the trade-off between week and day turns, and between simulating games automatically and operating games directly. Define what would justify revisiting either choice. (Game §§1–2, 7; implementation §1.)
- **Major — Terms and stop rules.** Use the same names for actionable decisions, reports and news. A significant customer update with no answer can still stop a batch. Say that a deadline includes the displayed week. (Game §§2, 5, 7; implementation §2.)
- **Major — Contracts.** A renewal reuses an existing slot, while a new registration claims a new slot. Specify the source of the fee, reservation release, and registration order. An injury vacancy is distinct from an available foreign-player slot. (Game §§2–5; implementation §3.)
- **Major — Spending and proving the loop.** Document opening funds and cost timing. Specify a deterministic test seed/actions for the first customer, zero/one/multiple reports and competing offers. (Game §§1, 4, 6–7; implementation §§4–5.)
- **Major — Recovery and constraints.** Define the effect of an unsuccessful write, a newer or damaged save and a restart. Describe the difference between preserving raw storage and a complete backup/restore path. (Game §7; implementation §§1–2, 5.)
- **Minor — Consistent screens and actions.** Keep button names consistent and assign the calendar to a screen. Use the same accessible reduction in animation for all entry paths. Present expected roles as estimates. (Game §§3–5, 7.)

The structural and wording reviews also distinguish the roles of customer agreements, club agreements and salary negotiation.
