# Security

This application has no backend, authentication, secrets, or server-side user data. Browser storage is optional and is validated on read. A hosting provider's security and logging settings are outside the application's scope.

Report sensitive vulnerabilities through [GitHub private vulnerability reporting](https://github.com/yashkhandelwal2828/armor-workshop/security/advisories/new). Include affected versions, reproduction steps, and expected impact. Do not post credentials, personal data, or exploit details in public issues.

Use [GitHub Issues](https://github.com/yashkhandelwal2828/armor-workshop/issues) for non-sensitive bugs and feature requests.

Before releases, run `npm audit`, `npm run check:source`, and the full `npm run check` when model assets are installed, and review changed dependencies and asset provenance. Production builds do not expose the development scene inspection object.
