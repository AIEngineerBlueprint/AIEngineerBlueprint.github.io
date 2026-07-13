# Contributing

AIEngineerBlueprint is intentionally static and maintainable. Contributions should improve technical accuracy, production realism, accessibility, or hands-on learning value.

## Principles

- Teach from first principles: why it exists, how it works, internals, trade-offs, and failure modes.
- Prefer production-grade examples over toy demos.
- Include evaluation, observability, security, cost, and release considerations.
- Keep the site offline-capable and backend-free.
- Preserve accessibility and responsive behavior.

## Workflow

1. Update `scripts/generate-site.js` for curriculum structure or generated lesson templates.
2. Update `assets/css/styles.css` or `assets/js/app.js` for platform behavior.
3. Run `node scripts/generate-site.js`.
4. Serve locally with `npm run serve`.
5. Check navigation, search, progress, quizzes, theme switching, and mobile layout.

## Content checklist

Every lesson should include objectives, theory, architecture, internals, an interactive example, code, hands-on lab, mini project, common mistakes, production considerations, quiz, interview questions, and references.
