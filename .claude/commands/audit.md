Perform a comprehensive audit of this codebase covering code quality, security, and performance. Be thorough and specific — reference file paths and line numbers for every issue found.

## 1. Code Quality
1. Run `npm audit`
2. Run `npm audit fix` to apply updates
3. Run tests and verify the updates didn't break anything
<!-- - Unused imports, variables, and dead code
- Functions or components that are too large or complex
- Duplicated logic that should be abstracted
- Missing or incorrect TypeScript types
- Inconsistent naming conventions
- TODO/FIXME comments left in code -->

<!-- ## 2. Security
- Exposed secrets, API keys, or credentials in code or config files
- Authentication and authorization gaps
- Unvalidated or unsanitized user input
- SQL injection or other injection risks
- Insecure cookie or session configuration
- Overly permissive CORS or middleware settings
- Sensitive data logged to console -->

<!-- ## 3. Performance
- Unnecessary re-renders in React components (missing memo, useCallback, useMemo)
- Large dependencies that could be replaced with lighter alternatives
- N+1 database query patterns
- Missing database indexes
- Unoptimized images or assets
- Blocking operations on the critical path
- Missing caching opportunities -->

<!-- ## Output Format
For each issue found, report:
- **Severity**: Critical / High / Medium / Low
- **Category**: Quality / Security / Performance
- **Location**: file path and line number
- **Issue**: what the problem is
- **Fix**: concrete recommendation -->

End with a prioritized summary of the top issues to address first.
