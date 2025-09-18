const REGION_LABELS = {
    'fg-emea': 'Financegram - EMEA Forum',
    'fg-usa': 'Financegram - USA Forum',
    'fg-asia': 'Financegram - Asia Forum',
};
const GLOBAL_FORUM = {
    id: 'fg-global',
    label: 'Financegram - Global Forum',
};
const UNIVERSITY_FORUMS = {
    'alumni.unav.es': {
        id: 'fg-uni-navarra',
        label: 'Financegram - University of Navarra Forum',
        region: 'fg-emea',
    },
    'unav.es': {
        id: 'fg-uni-navarra',
        label: 'Financegram - University of Navarra Forum',
        region: 'fg-emea',
    },
};
const TLD_REGION_MAP = {
    es: 'fg-emea',
    fr: 'fg-emea',
    uk: 'fg-emea',
    de: 'fg-emea',
    it: 'fg-emea',
    pt: 'fg-emea',
    ie: 'fg-emea',
    eu: 'fg-emea',
    edu: 'fg-usa',
    us: 'fg-usa',
    ca: 'fg-usa',
    mx: 'fg-usa',
    jp: 'fg-asia',
    sg: 'fg-asia',
    cn: 'fg-asia',
    hk: 'fg-asia',
    au: 'fg-asia',
    in: 'fg-asia',
};
function uniqueMemberships(entries) {
    const seen = new Set();
    const ordered = [];
    for (const entry of entries) {
        if (!seen.has(entry.id)) {
            seen.add(entry.id);
            ordered.push(entry);
        }
    }
    return ordered;
}
function determineRegionByEmail(email) {
    const domain = email.split('@')[1] ?? '';
    const parts = domain.split('.');
    const tld = parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
    return TLD_REGION_MAP[tld] ?? 'fg-emea';
}
export function buildCommunityMemberships(email, existing) {
    const lowerEmail = email.trim().toLowerCase();
    const domain = lowerEmail.split('@')[1] ?? '';
    const universityEntry = UNIVERSITY_FORUMS[domain];
    const region = universityEntry?.region ?? determineRegionByEmail(lowerEmail);
    const memberships = [
        GLOBAL_FORUM,
        { id: region, label: REGION_LABELS[region] },
    ];
    if (universityEntry) {
        memberships.push({ id: universityEntry.id, label: universityEntry.label });
    }
    if (existing?.length) {
        memberships.push(...existing);
    }
    return uniqueMemberships(memberships);
}
