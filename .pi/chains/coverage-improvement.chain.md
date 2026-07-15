---
name: coverage-improvement
description: Find code coverage gaps and implement fixes with parallel workers (max 5 concurrent)
---

- agent: coverage-finder
  task: Analyze the codebase and identify all code coverage improvement opportunities. Return structured JSON with opportunities array.
  as: coverage-analysis
  outputSchema:
    type: object
    properties:
      opportunities:
        type: array
        items:
          type: object
          properties:
            id:
              type: string
            file:
              type: string
            function:
              type: string
            lines:
              type: array
              items:
                type: number
            coverage:
              type: number
            type:
              type: string
              enum: [uncovered, low-coverage, complex-uncovered]
            priority:
              type: string
              enum: [high, medium, low]
            description:
              type: string
            suggestion:
              type: string
          required: [id, file, description]
      summary:
        type: object
        properties:
          totalOpportunities:
            type: number
    required: [opportunities]
  output: coverage-analysis.json
  progress: true

- expand:
    from:
      output: coverage-analysis
      path: /opportunities
    item: opportunity
    key: /id
    maxItems: 50
    onEmpty: skip
  parallel:
    agent: worker
    task: |
      Implement test coverage for this opportunity. Read the target file, understand the uncovered code, and add appropriate tests.
      
      Opportunity ID: {item.id}
      File: {item.file}
      Function: {item.function}
      Lines: {item.lines}
      Type: {item.type}
      Priority: {item.priority}
      Description: {item.description}
      Suggestion: {item.suggestion}
      
      INSTRUCTIONS:
      1. Read {item.file} to understand the code
      2. Identify what needs to be tested based on the uncovered lines
      3. Create or update test files in the appropriate test directory
      4. Write tests that cover the identified gaps
      5. Run tests to verify coverage improves
      6. Report: files created/modified, test results, and new coverage percentage
      
      CONSTRAINTS:
      - Only implement tests for THIS specific opportunity
      - Do NOT modify source code (only test files)
      - Follow existing test patterns in the project
      - Keep tests focused and maintainable
      - If tests fail, fix the test code (not source code)
    as: coverage-fix
    output: fixes/coverage-{item.id}.md
    outputMode: file-only
    context: fresh
    model: mistral/mistral-medium-3.5
  collect:
    as: all-fixes
  concurrency: 5
  failFast: false

- agent: context-builder
  task: Synthesize all coverage improvement results. Review total opportunities: {outputs.coverage-analysis.summary.totalOpportunities}, opportunities addressed: {length(outputs.all-fixes)}. Create a summary report with overview, list of fixes, failed opportunities, and recommendations.
  output: coverage-improvement-report.md
  progress: true
