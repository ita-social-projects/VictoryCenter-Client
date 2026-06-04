# prototype-humanizer

## Purpose

Rewrite prototype explanations, handoff documentation, and refinement notes into stakeholder-friendly language that sounds natural and collaborative rather than robotic or overly technical.

## When to Use This Skill

- Cleaning up AI-generated documentation before sharing with team
- Rewriting technical explanations for non-technical stakeholders
- Making refinement notes more approachable and readable
- Improving prototype walkthroughs for stakeholders
- Humanizing any communication that feels stiff or artificial

## Responsibilities

- Reduce robotic AI wording and phrasing
- Improve readability and flow
- Preserve implementation meaning and accuracy
- Make refinement notes sound natural and conversational
- Maintain appropriate formality (professional but not stiff)
- Remove unnecessary qualifiers and hedging language

## Transformation Principles

### Remove AI-isms
**Avoid**: "It should be noted that...", "It is important to mention...", "Furthermore...", "Additionally..."
**Prefer**: Direct statements, natural connectors like "Also", "Note:", "Keep in mind"

### Simplify Structure
**Avoid**: Overly formal sentence structures, passive voice, excessive nesting
**Prefer**: Active voice, shorter sentences, clear subject-verb-object order

### Use Natural Transitions
**Avoid**: "In conclusion", "To summarize", "With regards to"
**Prefer**: "So", "In short", "For", "About"

### Be Direct
**Avoid**: "It would be advisable to consider...", "One might want to..."
**Prefer**: "Consider...", "We should...", "Try..."

### Maintain Technical Accuracy
**Do**: Keep precise technical terms when needed
**Don't**: Oversimplify to the point of losing meaning

## Before/After Examples

### Example 1: Status Description

**Before** (Robotic):
```
It should be noted that the implementation of the order cancellation feature 
will require modifications to the existing status transition logic. Furthermore, 
it is important to mention that validation rules must be applied to prevent 
cancellation of orders that have already been shipped. Additionally, error 
handling should be implemented to address potential concurrent modification scenarios.
```

**After** (Humanized):
```
The order cancellation feature needs updates to the status transition logic. 
We'll add validation to block cancellation of shipped orders and handle errors 
if two managers try to edit the same order at the same time.
```

### Example 2: Technical Finding

**Before** (Robotic):
```
Upon examination of the codebase, it has been determined that the status badge 
component currently utilized in the order list view can potentially be reused 
for the edit form implementation, thereby reducing development effort.
```

**After** (Humanized):
```
Good news: we can reuse the status badge from the order list in the edit form, 
which saves development time.
```

### Example 3: Clarification Question

**Before** (Robotic):
```
It would be beneficial to obtain clarification regarding the intended behavior 
in the scenario where a user attempts to modify the discount percentage to a 
value exceeding the established threshold.
```

**After** (Humanized):
```
What should happen if a manager tries to set a discount above 20%?
```

## Preferred Tone

- **Collaborative**: "We", "let's", "our"
- **Practical**: Focus on action, not theory
- **Concise**: Remove filler words and unnecessary qualifiers
- **Clear**: One idea per sentence when possible
- **Professional**: Appropriate for cross-functional team communication

## What to Preserve

- Technical terminology when it's the clearest way to communicate
- Specific file paths, component names, API endpoints
- Numbers, thresholds, and quantitative details
- Business rule descriptions
- Structured lists when they aid clarity

## What to Remove

- Excessive hedging ("perhaps", "possibly", "potentially" used too often)
- Unnecessary formality ("it has been determined", "upon examination")
- Redundant phrases ("in order to" → "to")
- Empty transitions ("moreover", "furthermore" when simple "also" works)
- Passive voice where active is clearer

## Rules

- ✅ Make it sound like a person wrote it, not an AI
- ✅ Preserve all technical accuracy and implementation details
- ✅ Keep the structure if it serves clarity (lists, sections, etc.)
- ✅ Use contractions where natural ("we'll" not "we will")
- ✅ Address the reader directly when appropriate
- ❌ Don't oversimplify technical concepts
- ❌ Don't remove necessary context for brevity
- ❌ Don't make it too casual (keep it professional)
- ❌ Don't change meaning to sound better

## Output Format

When humanizing a document:
1. Provide the humanized version directly
2. Optionally note major changes if requested
3. Preserve original structure (headings, lists, etc.) unless restructuring improves clarity

## Integration with Other Skills

- Apply to outputs from **handoff-pack-writer** before sharing
- Use when finalizing reports from **figma-flow-analysis**
- Clean up **refinement-validator** assessments for stakeholders
- Polish **design-to-code-scout** explanations for mixed audiences

## Example Humanization Task

**Input**:
```
## Status Transition Validation Analysis

It has been observed that the current implementation does not include 
comprehensive validation logic for status transitions. It is recommended 
that validation be implemented to ensure that invalid transitions are 
prevented. Furthermore, consideration should be given to providing 
appropriate user feedback when validation failures occur.
```

**Output**:
```
## Status Transition Validation

The current code doesn't validate status transitions. We need to add 
checks to prevent invalid transitions and show clear error messages 
when validation fails.
```

## Success Criteria

Humanized text should:
- Sound natural when read aloud
- Be free of AI-style phrasing
- Maintain technical precision
- Be easy for non-technical stakeholders to understand
- Feel collaborative and action-oriented
