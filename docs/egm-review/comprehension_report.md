# Comprehension Review

## What this proposes

The player opens a Korean baseball agency, signs a domestic second-team player, then scouts and negotiates across four markets. Clubs play games and control lineups. The agent handles scouting reports, support and offers. Up to four weeks may advance when there is no unanswered decision. Registration requires player consent, budget and an available slot and generates the agency fee once. The first playable version is offline on mobile and follows one save to the second season. (Game §§1–7; implementation §§2–6.)

## How the existing system works, per this document

The document describes an empty repository at drafting time and proposes a TypeScript simulation with mobile web UI reused on Android. It assigns fixtures and standings to the simulation, scouting and contracting to the agency module, presentation to the UI, and persistence to a versioned local save. (Implementation introduction and §1.)

## Findings

1. **Major — Eligibility.** Team rights may outlive a contract, but their release and how overseas permission is granted or revoked are unspecified. (Game §§3, 5–6; implementation §3.)
2. **Major — Batch interruption.** These documents use different stop lists, leaving the treatment of registration and important news without a response ambiguous. (Game §§2, 7; implementation §§2, 5.)
3. **Major — Reply and deadline.** It is unclear whether the last displayed week is inclusive and whether replies can arrive later than the next week. (Game §§2, 5; implementation §§2, 5.)
4. **Major — Failed future registration.** No clear disposition of the reservation or closed offers after a failed registration is specified. (Game §§5, 7; implementation §§3, 5.)
5. **Major — Agency progression.** The initial offer and later capacity have no clear trigger. It is also unclear what network spending buys. (Game §§1–2, 4, 6; implementation §§1, 5.)
6. **Major — Player support.** Costs and review dates are listed. It remains unclear whether support affects information, relationships or the club's decisions. (Game §§2, 4, 7; implementation §§2, 5.)
7. **Major — Follow-up choices.** The two documents leave time and slot cost of extra investigation and the output of a meeting ambiguous. (Game §§2, 4; implementation §§2, 4.)
8. **Minor — Source of preferences.** The first scout report is said to contain player interests, but its data list omits them. Define whether preferences are in the report or learned through meetings. (Game §4; implementation §4.)

This reader examined the documents only.
