---
name: add-contributor
description: "Use when adding a new contributor to the Goravel docs. Fetches GitHub avatar and adds contributor links to all language versions of prologue/contributions.md and index.md"
---

# Add Contributor Skill

This skill automates adding a new contributor to the Goravel documentation contributor lists across all language versions (`en/`, `zh_CN/`, `uz_UZ/`, and any future language directories) of `prologue/contributions.md` and `index.md`.

## Workflow

### 1. Input: GitHub Profile URL

The user provides a GitHub profile URL, e.g.:
```
https://github.com/hwbrzzl
```

### 2. Extract Username

From the URL, extract the username (e.g., `hwbrzzl`).

### 3. Fetch Avatar URL

Make a fetch request to the GitHub API to get the user's profile data:
- Endpoint: `https://api.github.com/users/{username}`
- Extract the `avatar_url` field from the JSON response
- The URL will be in the format: `https://avatars.githubusercontent.com/u/{user_id}?v=4`

### 4. Generate HTML Snippet

Create an HTML anchor tag with the avatar image:
```html
<a href="https://github.com/{username}" target="_blank"><img src="{avatar_url}" width="48" height="48"></a>
```

### 5. Add to Contribution Sections

Use glob patterns to discover all language directories containing the target files:
- `*/prologue/contributions.md`
- `*/index.md`

For each matching file across all languages, insert the HTML snippet into the appropriate section. The HTML snippet is language-agnostic (GitHub URLs and avatars), so the same snippet works in every language.

**`{lang}/prologue/contributions.md`:**
- **Core Developers** section: Insert the new `<a>` tag before the closing `</div>` of the Core Developers block.
- **Contributors** section: Insert the new `<a>` tag before the closing `</div>` of the Contributors block.

**`{lang}/index.md`:**
- **Contributors** section: Insert the new `<a>` tag before the closing `</div>` of the contributors block.

All contributor `<div>` blocks share the `:class="$style.contributors"` attribute, making them easy to locate across languages regardless of heading text.

### 6. Update Documentation

Update all matching files across every language directory and verify the contributor appears correctly in the rendered documentation for each language.

## Implementation Steps

1. Request the GitHub profile URL from the user
2. Extract the username from the URL
3. Fetch user data from GitHub API to get the avatar URL
4. Create the HTML contributor entry
5. Use glob `*/prologue/contributions.md` to find all language versions, then insert the entry into the appropriate section (Core Developers or Contributors) of each file
6. Use glob `*/index.md` to find all language versions, then insert the entry into the Contributors list of each file
7. Confirm addition in all files across all language directories

## Example

**Input:** `https://github.com/hwbrzzl`

**Extracted User ID from API:** `108449432`

**Generated Snippet:**
```html
<a href="https://github.com/hwbrzzl" target="_blank"><img src="https://avatars.githubusercontent.com/u/108449432?v=4" width="48" height="48"></a>
```

**Location in Files:**
- `{lang}/prologue/contributions.md`: Added to the target section before `</div>` closing tag (all language directories)
- `{lang}/index.md`: Added to Contributors section before the closing `</div>` (all language directories)
