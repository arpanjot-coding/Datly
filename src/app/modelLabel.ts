/**
 * Short, human-readable labels for model IDs shown in the chrome.
 *
 * Providers often ship IDs like `claude-sonnet-4-20250514`. The chip in
 * the landing prompt cannot fit that, and it reads like a build artifact.
 */

const DATE_SUFFIX = /-\d{8}$/;

function titleToken(token: string): string {
    if (/^gpt$/i.test(token)) return 'GPT';
    if (/^gpt\d/i.test(token)) return token.replace(/^gpt/i, 'GPT');
    if (/^o\d/i.test(token)) return token;
    if (/^\d/.test(token)) return token;
    return token.charAt(0).toUpperCase() + token.slice(1);
}

export function formatModelLabel(model: string): string {
    const trimmed = model.trim();
    if (!trimmed) return trimmed;

    const withoutDate = trimmed.replace(DATE_SUFFIX, '');
    const parts = withoutDate.split(/[-_]+/).filter(Boolean);
    const words: string[] = [];

    for (let i = 0; i < parts.length; i += 1) {
        const current = parts[i];
        const next = parts[i + 1];
        if (/^\d$/.test(current) && next && /^\d$/.test(next)) {
            words.push(`${current}.${next}`);
            i += 1;
            continue;
        }
        words.push(titleToken(current));
    }

    if (words[0] === 'GPT' && words[1] && /^[\d.]/.test(words[1])) {
        return [`GPT-${words[1]}`, ...words.slice(2)].join(' ');
    }
    return words.join(' ');
}
