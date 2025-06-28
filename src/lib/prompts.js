export const PROMPTS = {
  initial: `You are an expert in creating comprehensive rule sets for AI agents, specifically for Claude AI. Generate rules for:

AGENT TYPE: {agentType}

Create a complete set of rules in Markdown format that:
1. Defines the agent's primary purpose and capabilities
2. Establishes behavioral guidelines and tone
3. Sets boundaries and restrictions
4. Covers edge cases and error handling
5. Includes ethical considerations

Format the output as a claude.md file with clear sections and bullet points. Be specific and actionable.`,

  evaluate: `Review these Claude AI agent rules critically:

{rules}

Identify:
1. Missing capabilities or scenarios that should be covered
2. Ambiguous or contradictory rules that need clarification
3. Areas needing more specificity or detail
4. Potential safety or ethical concerns not addressed
5. Gaps in error handling or edge case coverage
6. Missing instructions for tone, style, or behavior

Provide specific, actionable feedback for improvement. Be thorough but concise.`,

  enhance: `Based on this evaluation:
{evaluation}

Enhance these rules:
{rules}

Create an improved version that:
- Addresses all identified gaps and concerns
- Resolves ambiguities and contradictions
- Adds necessary detail and specificity
- Strengthens safety measures and ethical guidelines
- Maintains Claude-specific formatting and structure
- Includes clear behavioral guidelines

Output as a complete claude.md file with proper Markdown formatting.`,

  finalize: `Perform a final review and polish of these Claude rules:

{rules}

Ensure:
1. Complete coverage for the agent type with no major gaps
2. Clear, actionable instructions that Claude can follow
3. Proper Markdown formatting with headers and bullet points
4. Meta-rules for handling edge cases and unexpected situations
5. Appropriate tone and style guidelines
6. Safety and ethical considerations are well-covered

Add a professional header with:
- Agent type and purpose
- Brief description of capabilities
- Key behavioral guidelines

Output the final, polished claude.md content ready for production use.`
};