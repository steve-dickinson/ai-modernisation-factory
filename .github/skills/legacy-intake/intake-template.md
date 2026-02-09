# Legacy Application Intake

> This document captures a **shared, evidence-based understanding** of the legacy system.
> It records what is known, what is observed, and what is unknown.
>
> **No modernisation decisions are made in this document.**

---

## Document Control

- **Repository**:
- **GitHub URL**:
- **Analysis Date**:
- **Current Version**:
- **System Owner**:
- **Review Status**: Draft | Reviewed | Approved

---

## 1. System Purpose (Facts Only)

Describe what the system does **today** in plain language.

Rules:
- focus on business outcomes
- avoid implementation detail
- do not describe desired or future behaviour

Evidence:
- README.md
- user documentation
- observable workflows

---

## 2. Users and Stakeholders

Who uses or depends on this system.

| Role / Group | Description | Evidence |
|-------------|------------|----------|

Include:
- human users
- upstream systems
- downstream systems

---

## 3. Observable Business Capabilities

List **capabilities the system demonstrably performs**.

Rules:
- phrase as actions (“Processes X”, “Validates Y”)
- avoid internal class or function names
- include only what can be evidenced

| Capability | Evidence |
|-----------|----------|

---

## 4. Data Sources and Stores

List all known data inputs and outputs.

| Name | Type | Purpose | Evidence |
|-----|------|---------|----------|

Include:
- databases
- blob storage
- Excel files
- Access tables
- queues/topics

---

## 5. Business Rules (Explicit Only)

List business rules that are **explicitly implemented**.

Rules:
- must be testable
- must be observable in code or configuration
- inferred rules must go in “Unknowns & Assumptions”

| Rule | Description | Source | Evidence |
|-----|-------------|--------|----------|

---

## 6. Integrations

### Inbound Integrations

Who or what calls this system.

| Source | Interface | Evidence |
|-------|----------|----------|

### Outbound Integrations

Who or what this system calls.

| Target | Interface | Evidence |
|-------|----------|----------|

---

## 7. Runtime Behaviour

Describe observable runtime characteristics.

Include only what can be evidenced:
- triggers (HTTP, queue, schedule)
- batch processing
- background jobs
- synchronous vs asynchronous behaviour

Evidence examples:
- function attributes
- cron expressions
- pipeline configs

---

## 8. Infrastructure and Deployment (As-Is)

Describe **current** infrastructure only.

Include:
- hosting platform
- containerisation (if any)
- deployment mechanism
- scaling configuration (if visible)

Do not assess suitability or quality.

---

## 9. Testing and Quality Signals (Observed)

Record what testing and quality mechanisms are present.

| Area | Observed | Evidence |
|-----|---------|----------|
| Unit tests | Yes / No | |
| Integration tests | Yes / No | |
| CI pipeline | Yes / No | |
| Security scanning | Yes / No | |

No judgement. Facts only.

---

## 10. Security and Compliance (Observed)

List observable security mechanisms.

Examples:
- authentication methods
- secret handling
- identity usage
- scanning tools

Do not speculate about adequacy.

---

## 11. Unknowns and Assumptions (Mandatory)

List items that **cannot be confirmed** from the repository alone.

| Item | Reason Unknown | Requires |
|-----|---------------|----------|
| | | Code review / Stakeholder input / Runtime data |

This section must never be empty.

---

## 12. Questions for Stakeholders

Questions that must be answered before any modernisation work.

Rules:
- phrased as questions
- no implied solutions

---

## Intake Acceptance Checklist

Before approving this intake:

- [ ] All factual claims have evidence
- [ ] All assumptions are explicitly listed
- [ ] No future-state or modernisation decisions appear
- [ ] System owner has reviewed and confirmed accuracy

---

## Approval

- **Reviewed By**:
- **Date**:
- **Decision**: Approved | Rejected | Needs Update

