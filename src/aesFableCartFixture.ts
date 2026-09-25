/**
 * FableCart — a fictional AES workflow assessment fixture.
 *
 * FableCart is a made-up mid-size retailer. This assessment exists to prove
 * the {@link AesWorkflowAssessment} shape end-to-end (CLI command, report
 * generator, HTML/text renderers) with a realistic, fully-populated example,
 * without needing a real team's answers yet. Nothing in this fixture is a
 * real repository, organisation or person.
 *
 * The workflow chosen — "Order status API" — deliberately spans two
 * repositories, illustrating why AES assesses a *workflow*, not a repository:
 * Dark Factory Readiness would report on `fablecart/order-service` and
 * `fablecart/storefront-web` separately, but the workflow that actually
 * delivers customer value crosses both.
 */
import type { AesSupportingEvidence, AesWorkflowAssessment } from './types';
import { AES_ASSESSMENT_SCHEMA_VERSION } from './aesWorkflowAssessment';

const FABLECART_SUPPORTING_EVIDENCE: AesSupportingEvidence[] = [
	{
		repo: 'fablecart/order-service',
		controlId: 'ci-test-execution',
		controlLabel: 'CI runs a test suite',
		state: 'present',
		detail: '.github/workflows/ci.yml runs `npm test` on every pull request.',
		informs: 'deliver',
	},
	{
		repo: 'fablecart/order-service',
		controlId: 'independent-evaluator-agent',
		controlLabel: 'Independent evaluator agent',
		state: 'absent',
		detail: 'Two agent definitions exist (`implementer.agent.md`, `docs-writer.agent.md`); neither reads as review, test or security.',
		informs: 'governance',
	},
	{
		repo: 'fablecart/storefront-web',
		controlId: 'agent-authored-pull-requests',
		controlLabel: 'Agent-authored pull requests',
		state: 'present',
		detail: '6 of 41 pull requests in the analysed window were agent-authored.',
		informs: 'deliver',
	},
	{
		repo: 'fablecart/storefront-web',
		controlId: 'code-scanning',
		controlLabel: 'Code scanning (CodeQL)',
		state: 'unknown',
		detail: 'Needs a GitHub token with access to this repository — not checked.',
		informs: 'governance',
	},
];

/**
 * A fictional, fully-populated AES self-assessment for FableCart's
 * "Order status API" workflow. Used as the CLI's default `aes` command
 * input until a real assessment-authoring path (a guided VS Code view, or a
 * `--file` input) exists — see `docs/features/AES-WORKFLOW-ASSESSMENT.md`.
 */
export const FABLECART_AES_ASSESSMENT: AesWorkflowAssessment = {
	schemaVersion: AES_ASSESSMENT_SCHEMA_VERSION,
	workflow: {
		name: 'Order status API',
		description:
			'Exposes real-time order status (placed, packed, shipped, delivered) to the storefront and to ' +
			'customer-support tooling. Spans the order-fulfilment backend and the storefront front end.',
		repositories: ['fablecart/order-service', 'fablecart/storefront-web'],
	},
	assessedAt: '2026-02-10T09:00:00.000Z',
	assessedBy: 'FableCart Storefront team',
	outcome: {
		customerValue:
			'Customers stop contacting support to ask "where is my order?" and instead find an accurate, ' +
			'trustworthy answer themselves.',
		customers: 'Retail customers with an in-flight order, and the support agents who currently field their questions.',
	},
	activities: {
		define: {
			description:
				'Product and support triage new status-accuracy complaints into GitHub issues, each naming the ' +
				'order states affected and an acceptance check.',
			delegation: 'agent-assisted',
			signal: 'Share of defined work that enters delivery without major re-scoping.',
			notes:
				'An agent drafts the issue from the support ticket and prior similar issues, but a human product ' +
				'owner sets the acceptance criteria and priority before it is picked up.',
		},
		deliver: {
			description:
				'Small, well-bounded fixes (a missing status transition, a stale cache key) are implemented, ' +
				'tested and opened as a pull request by an agent under CI; a human reviews and merges.',
			delegation: 'agent-performed-reviewed',
			signal: 'Whether faster delivery is increasing customer value or just creating more in-flight work and review burden.',
			notes: 'Agent-authored PRs are currently 15% of the total and have not increased review turnaround time.',
		},
		detect: {
			description:
				'Status-accuracy incidents surface through a support-ticket tag and a synthetic monitor that ' +
				'polls the public status endpoint hourly; both feed a shared triage board.',
			delegation: 'agent-assisted',
			signal: 'Detection latency, signal coverage, and how often detected issues are structured and fed back into future work.',
			notes: 'An agent summarizes weekly ticket volume by order state, but a human still decides what gets triaged.',
		},
	},
	modes: {
		director: {
			delegation: 'agent-assisted',
			notes: 'Product owner sets scope and priority; an agent surfaces support-ticket patterns and drafts options.',
		},
		performer: {
			delegation: 'agent-performed-reviewed',
			notes: 'Agents implement bounded fixes end-to-end; humans still perform anything touching the payments-adjacent order-total logic.',
		},
		assessor: {
			delegation: 'agent-assisted',
			notes: 'CI plus a human reviewer assess every change; no independent review/test/security agent is defined yet.',
			antiPatternsObserved: [
				'No dedicated review or test agent exists, so the same agent definition that drafts a fix could in principle also be asked to judge it.',
			],
		},
	},
	stocks: {
		governance: {
			rating: 'developing',
			evidence:
				'CI and required review are in place for both repositories. Deployment approval for storefront-web is ' +
				'still a manual Slack message rather than an environment protection rule, and code scanning status is unverified.',
			signalsConsidered: [
				'The share of low-risk work that still queues for manual review',
				'Whether approved tools and workflows are actually being used',
			],
		},
		sharedKnowledge: {
			rating: 'developing',
			evidence:
				'order-service has current AGENTS.md instructions and a versioned API spec; storefront-web has neither, ' +
				'so agents working there rely on reading existing code rather than written intent.',
			signalsConsidered: [
				'The freshness and quality of documentation, instruction files, and architecture records',
				'How often agent or human work has to be re-scoped because key context was missing',
			],
		},
		customerValue: {
			rating: 'weak',
			evidence:
				'Support-ticket volume for "where is my order?" is tracked, but nobody currently reports whether shipped ' +
				'fixes actually reduced it — the team ships changes without closing the loop back to the ticket trend.',
			signalsConsidered: ['Customer-reported defects and support volume trends'],
		},
	},
	supportingEvidence: FABLECART_SUPPORTING_EVIDENCE,
	notes:
		'This is a fictional fixture used to prove the AES assessment model end-to-end. It is not a real ' +
		'FableCart, and no such company exists.',
};
