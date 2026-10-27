# Supervision indicators — definitions

Business timezone for month boundaries: **America/Argentina/Buenos_Aires** (backend `timeZone` on the dashboard DTO).

## Sales KPIs

| Indicator               | Meaning                                                                                 | Not the same as                                            |
| ----------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Ventas presentadas      | Distinct sales whose **first** submit (`first_submitted_at`) falls in the period        | Approved / closed sales; re-presentations                  |
| Cumplimiento mensual    | `salesPresented ÷ targetValue × 100` when a goal exists and target ≠ 0                  | “0%” when there is **no** goal → UI shows **Sin objetivo** |
| Devueltas (stock)       | Sales currently in `RETURNED`                                                           | Return **events** during the month (`returnsInPeriod`)     |
| Tasa de devoluciones    | Among first presentations in the period, share that ever had a return event (until now) | Current RETURNED stock                                     |
| Presentadas (cola)      | Current `SUBMITTED` stock                                                               | Presentations counted in the month                         |
| En revisión             | Current `IN_REVIEW` stock                                                               | Reviews **started** in the period                          |
| Seguimientos pendientes | Follow-ups with status OPEN whose next date is in the future or null                    | Overdue OPEN follow-ups                                    |
| Seguimientos vencidos   | OPEN follow-ups with `nextFollowUpAt ≤ now`                                             | Done follow-ups                                            |

## Administrative KPIs

| Indicator               | Meaning                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| Gestiones / volumen     | Observations + follow-ups + review starts attributed to the user    |
| Revisiones iniciadas    | `SUBMITTED → IN_REVIEW` transitions by that administrative          |
| Tiempo 1ª revisión      | Average hours from first presentation to first IN_REVIEW            |
| Devoluciones realizadas | Return actions by that user in the period                           |
| Carga actual            | Sales currently assigned / in their active review scope (API field) |

Do **not** invent a quality score or ranking of administratives from these numbers alone.

## Alert thresholds (UI)

Aligned with backend supervision alerts; documented in `SUPERVISION_ALERT_THRESHOLDS`:

| Key                        | Value | Use                                       |
| -------------------------- | ----- | ----------------------------------------- |
| `overdueFollowUpsWarn`     | 5     | Attention copy / warning severity context |
| `overdueFollowUpsCritical` | 10    | Critical context                          |
| `returnedStockWarn`        | 10    | High RETURNED stock context               |

Seller “behind goal” chips on the dashboard: compliance **&lt; 70%** with a non-zero goal (explicit UI filter, not a silent invention of API fields).

## Goal metrics (`goalType`)

| Type                 | Unit  | Subject               |
| -------------------- | ----- | --------------------- |
| `SALES_SUBMITTED`    | COUNT | TEAM or USER (seller) |
| `REVIEWS_STARTED`    | COUNT | USER (administrative) |
| `FIRST_REVIEW_HOURS` | HOURS | USER (administrative) |

Closed (past) months: PATCH requires `reason` (min. 3 chars); UI confirms before save.

Goals and goal-derived compliance tracking are temporarily paused. Their formulas above remain documented for reactivation; current screens omit target/compliance indicators and API goal lookups return no target without reading stored goals. Monthly operations use the supervisor-home contract definitions described in [Home](../home/overview.md#supervisor-monthly-workspace-2026-10-27).
