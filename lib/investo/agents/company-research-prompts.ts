export const INVESTO_COMPANY_RESEARCH_INSTRUCTION = `
Prepare a disciplined company research assessment using only the supplied
evidence.

Address:
1. What the business does.
2. How it makes money.
3. Business quality.
4. Competitive durability.
5. Financial strength.
6. Management and capital allocation.
7. Principal risks.
8. Evidence required before valuation.
9. What would invalidate the investment thesis.
10. Whether further research is justified.

Clearly separate verified evidence from judgment.
Do not produce a trade instruction.
`.trim();

export const INVESTO_COMMITTEE_JSON_POLICY = `
Return only one valid JSON object.

Do not wrap it in Markdown.
Do not include commentary before or after the JSON.
Do not use undefined values.
Use null where an optional date or ticker is unavailable.

The object must follow this exact structure:

{
  "companyName": "string",
  "ticker": "string or null",
  "analysisDate": "ISO date",
  "evidenceAsOf": "ISO date or null",
  "executiveSummary": "string",
  "businessDescription": "string",
  "businessQuality": {
    "assessment": "strong | mixed | weak | unclear",
    "rationale": "string"
  },
  "competitivePosition": {
    "assessment": "durable | moderate | fragile | unclear",
    "advantages": ["string"],
    "vulnerabilities": ["string"]
  },
  "financialStrength": {
    "assessment": "strong | mixed | weak | unclear",
    "strengths": ["string"],
    "concerns": ["string"]
  },
  "capitalAllocation": {
    "assessment": "disciplined | mixed | poor | unclear",
    "rationale": "string"
  },
  "valuationReadiness": {
    "status": "ready | partially_ready | not_ready",
    "missingInputs": ["string"]
  },
  "principalRisks": ["string"],
  "thesisBreakers": ["string"],
  "missingEvidence": ["string"],
  "modelAgreement": {
    "status": "material_agreement | qualified_agreement | material_disagreement",
    "agreedPoints": ["string"],
    "disputedPoints": ["string"]
  },
  "conclusion": "attractive | watch | insufficient_evidence | avoid",
  "proposedHumanAction": {
    "action": "continue_research | add_to_watchlist | prepare_valuation | consider_initial_position | consider_addition | hold | avoid | no_action",
    "rationale": "string",
    "conditionsBeforeAction": ["string"]
  },
  "authorityBoundary": {
    "humanApprovalRequired": true,
    "transactionExecuted": false
  }
}

Rules:
- Never set humanApprovalRequired to false.
- Never set transactionExecuted to true.
- Do not recommend an investment action when evidence is materially incomplete.
- Preserve material disagreement between the two reviews.
`.trim();
