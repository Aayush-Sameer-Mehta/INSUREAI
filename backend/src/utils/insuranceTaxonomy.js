/* ═══════════════════════════════════════════════════════════════
   InsureAI — IRDAI Insurance Taxonomy (Single Source of Truth)
   Covers all 12 insurance segments defined in the Indian
   insurance ecosystem regulated by IRDAI.
   ═══════════════════════════════════════════════════════════════ */

/* ─── 4 Primary IRDAI Segments ─────────────────────────────── */
export const INSURANCE_SEGMENTS = [
    { key: "life", label: "Life Insurance", desc: "Human life risk + investment products" },
    { key: "health", label: "Health Insurance", desc: "Medical, hospitalization & wellness" },
    { key: "general", label: "General Insurance (Non-Life)", desc: "Motor, property, liability, travel, etc." },
    { key: "reinsurance", label: "Reinsurance", desc: "Insurance for insurers — risk transfer between companies" },
];

/* ─── All 12 Categories with Metadata ──────────────────────── */
export const INSURANCE_CATEGORIES = {
    health: {
        label: "Health",
        segment: "health",
        subtypes: [
            "individual_health", "family_floater", "group_health",
            "senior_citizen", "critical_illness", "disease_specific",
            "topup_super_topup", "personal_accident", "disability",
            "maternity",
        ],
    },
    life: {
        label: "Life",
        segment: "life",
        subtypes: [
            "term_life", "whole_life", "endowment", "money_back",
            "ulip", "child_plan", "pension_annuity", "retirement",
            "group_life",
        ],
    },
    car: {
        label: "Car",
        segment: "general",
        subtypes: ["comprehensive_car", "third_party_car", "standalone_od_car"],
    },
    bike: {
        label: "Bike",
        segment: "general",
        subtypes: ["comprehensive_bike", "third_party_bike"],
    },
    travel: {
        label: "Travel",
        segment: "general",
        subtypes: ["domestic_travel", "international_travel", "student_travel", "corporate_travel"],
    },
    home: {
        label: "Home",
        segment: "general",
        subtypes: [
            "home_structure", "home_contents", "fire",
            "shop", "industrial_property", "burglary_theft",
            "engineering", "equipment_breakdown",
        ],
    },
    motor_commercial: {
        label: "Motor Commercial",
        segment: "general",
        subtypes: ["commercial_vehicle", "fleet", "third_party_commercial"],
    },
    liability: {
        label: "Liability",
        segment: "general",
        subtypes: [
            "public_liability", "product_liability",
            "professional_indemnity", "directors_officers",
            "employers_liability",
        ],
    },
    business: {
        label: "Business",
        segment: "general",
        subtypes: [
            "marine_cargo", "business_interruption", "cyber",
            "fidelity_guarantee", "credit", "trade",
        ],
    },
    agriculture: {
        label: "Agriculture",
        segment: "general",
        subtypes: ["crop", "weather", "livestock", "farm_equipment"],
    },
    micro_social: {
        label: "Micro & Social",
        segment: "general",
        subtypes: ["microinsurance", "pmjjby", "pmsby", "rural", "social_security"],
    },
    specialty: {
        label: "Specialty",
        segment: "general",
        subtypes: [
            "cyber_personal", "gadget_mobile", "pet",
            "event_wedding", "parametric",
        ],
    },
};

/* ─── Flat list of all valid categories ────────────────────── */
export const ALL_CATEGORY_KEYS = Object.keys(INSURANCE_CATEGORIES);

/* ─── Category → Subtype flat map ──────────────────────────── */
export const CATEGORY_SUBTYPES = Object.fromEntries(
    Object.entries(INSURANCE_CATEGORIES).map(([cat, meta]) => [cat, meta.subtypes])
);

/* ─── Coverage insights per category ───────────────────────── */
const COVERAGE_INSIGHTS = {
    motor_commercial: {
        risksCovered: [
            "Third-party liability (mandatory under Motor Vehicles Act)",
            "Own damage to commercial vehicles",
            "Fire, theft, and natural calamities",
            "Personal accident cover for driver & cleaner",
            "Transit of goods damage",
        ],
        exclusions: [
            "Wear and tear / mechanical breakdown",
            "Driving without valid commercial license",
            "Overloading beyond GVW",
            "Using vehicle outside permit zone",
            "Consequential loss",
        ],
    },
    liability: {
        risksCovered: [
            "Legal liability to third parties for bodily injury / death",
            "Property damage caused to third parties",
            "Professional negligence claims",
            "Directors & Officers wrongful acts defense costs",
            "Employer liability for workplace injury",
        ],
        exclusions: [
            "Criminal acts and intentional wrongdoing",
            "Known liabilities before policy inception",
            "Nuclear, chemical, biological risks",
            "Punitive damages (in some policies)",
            "Contractual liability (unless specifically covered)",
        ],
    },
    business: {
        risksCovered: [
            "Marine cargo damage during transit (sea, air, road)",
            "Business interruption due to insured perils",
            "Cyber attack costs — data breach, ransomware, forensics",
            "Employee dishonesty / fidelity guarantee",
            "Trade credit risk — buyer default",
        ],
        exclusions: [
            "War and sanctions-related losses",
            "Intentional misconduct by management",
            "Pre-existing cyber vulnerabilities (without disclosure)",
            "Routine business losses",
            "Losses from non-compliance with regulations",
        ],
    },
    agriculture: {
        risksCovered: [
            "Crop loss from drought, flood, cyclone, pest attack",
            "Livestock death due to disease or accident",
            "Weather index parametric payouts",
            "Farm equipment breakdown and theft",
            "Post-harvest storage losses (select schemes)",
        ],
        exclusions: [
            "Wilful destruction of crops",
            "War and nuclear risks",
            "Losses covered under government relief",
            "Theft of crop (without police report)",
            "Pre-existing livestock diseases",
        ],
    },
    micro_social: {
        risksCovered: [
            "PMJJBY — ₹2 lakh life cover for death from any cause (₹436/year)",
            "PMSBY — ₹2 lakh accidental death, ₹1 lakh partial disability (₹20/year)",
            "Microinsurance — low-premium basic cover for BPL / rural populations",
            "Social security — pension and financial inclusion products",
        ],
        exclusions: [
            "PMJJBY — suicide in first year",
            "PMSBY — self-inflicted injuries",
            "Claims without Aadhaar/bank linkage",
            "Policies not renewed by annual auto-debit date",
        ],
    },
    specialty: {
        risksCovered: [
            "Gadget / mobile — accidental damage, liquid damage, screen cracking",
            "Pet insurance — veterinary treatment, third-party liability, theft",
            "Event/wedding — cancellation, vendor no-show, weather disruption",
            "Parametric — automatic payout triggered by weather index (no claim process)",
        ],
        exclusions: [
            "Gadget — cosmetic damage, pre-existing defects, loss without FIR",
            "Pet — pre-existing conditions, breeding costs, exotic species",
            "Event — change of mind cancellation, government-ordered shutdowns",
            "Parametric — events outside defined trigger parameters",
        ],
    },
};

/**
 * Get IRDAI-compliant coverage insights for a category.
 * @param {string} category
 * @returns {{ risksCovered: string[], exclusions: string[] } | null}
 */
export function getCoverageInsights(category) {
    return COVERAGE_INSIGHTS[category] || null;
}

/**
 * Classify a text query into the best-matching category.
 * Returns { segment, category, subtype } or null.
 */
const CLASSIFICATION_KEYWORDS = {
    motor_commercial: ["commercial vehicle", "fleet", "truck insurance", "goods vehicle", "commercial motor", "taxi insurance", "bus insurance", "transport vehicle"],
    liability: ["liability", "indemnity", "d&o", "directors and officers", "professional liability", "public liability", "employer liability", "product liability"],
    business: ["marine", "cargo", "business interruption", "cyber insurance", "fidelity", "credit insurance", "trade insurance", "corporate insurance"],
    agriculture: ["crop", "agriculture", "farming", "livestock", "cattle", "weather insurance", "pmfby", "farm equipment", "kisan", "harvest"],
    micro_social: ["pmjjby", "pmsby", "microinsurance", "micro insurance", "government scheme", "jan suraksha", "jeevan jyoti", "social security", "rural insurance", "bpl"],
    specialty: ["gadget", "mobile insurance", "phone insurance", "pet insurance", "dog insurance", "cat insurance", "event insurance", "wedding insurance", "parametric"],
};

export function classifyInsurance(text) {
    const lower = text.toLowerCase();
    let bestCat = null;
    let bestScore = 0;

    for (const [cat, keywords] of Object.entries(CLASSIFICATION_KEYWORDS)) {
        let score = 0;
        for (const kw of keywords) {
            if (lower.includes(kw)) score += kw.split(" ").length;
        }
        if (score > bestScore) {
            bestScore = score;
            bestCat = cat;
        }
    }

    if (!bestCat) return null;

    const meta = INSURANCE_CATEGORIES[bestCat];
    return {
        segment: meta.segment,
        category: bestCat,
        subtypes: meta.subtypes,
    };
}
