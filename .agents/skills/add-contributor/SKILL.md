---
name: add-contributor
description: "Use when adding a new contributor to the Goravel docs. Fetches GitHub avatar and adds contributor link to contributions.md"
---

# Add Contributor Skill

This skill automates adding a new contributor to the Goravel documentation's contributors list in `contributions.md`.

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

### 5. Add to Contribution Section

Locate the appropriate section in `en/prologue/contributions.md`:
- **Contributors** section: Add to the Contributors `<div>` block
- **Core Developers** section: Add to the Core Developers `<div>` block (if applicable)

Insert the HTML snippet as a new line before the closing `</div>` tag.

### 6. Update Documentation

Update the file and verify the contributor appears correctly in the rendered documentation.

## Implementation Steps

1. Request the GitHub profile URL from the user
2. Extract the username from the URL
3. Fetch user data from GitHub API to get the avatar URL
4. Create the HTML contributor entry
5. Insert into the appropriate section of `en/prologue/contributions.md`
6. Confirm addition

## Example

**Input:** `https://github.com/hwbrzzl`

**Extracted User ID from API:** `108449432`

**Generated Snippet:**
```html
<a href="https://github.com/hwbrzzl" target="_blank"><img src="https://avatars.githubusercontent.com/u/108449432?v=4" width="48" height="48"></a>
```

**Location in File:** Added to Contributors section before `</div>` closing tag
