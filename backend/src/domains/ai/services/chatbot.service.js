import Policy from "../../policies/models/Policy.js";
import axios from "axios";
import { GoogleGenAI, Type } from "@google/genai";

/* ═══════════════════════════════════════════════════════════════
   InsureAI Chatbot Service
   A comprehensive, self-contained insurance chatbot engine.
   – Rich insurance knowledge base (general + category-specific)
   – Intent detection via keyword scoring
   – Insurance-only guardrail (rejects off-topic questions)
   – Real policy recommendations from MongoDB
   ═══════════════════════════════════════════════════════════════ */

/* ─── Insurance keyword universe (used by guardrail) ─────────── */
// Multi-word phrases are checked via simple includes().
// Single/short words that could be ambiguous are checked via word-boundary regex.
const INSURANCE_PHRASE_KEYWORDS = [
    // multi-word phrases (safe to .includes() match)
    "insurance", "premium", "coverage", "claim", "insure", "insured",
    "underwriting", "deductible", "copay", "co-pay", "nominee",
    "beneficiary", "sum assured", "sum insured", "endowment",
    "add-on", "addon", "renewal", "renew", "lapse", "surrender",
    "cashless", "reimbursement", "tpa", "third party", "own damage",
    "no claim bonus", "waiting period", "exclusion",
    "pre-existing", "floater", "individual plan", "family plan",
    "term plan", "term life", "whole life", "ulip", "annuity",
    "pension", "gratuity", "group insurance", "mediclaim",
    "critical illness", "health insurance", "life insurance",
    "car insurance", "bike insurance", "travel insurance",
    "home insurance", "vehicle insurance", "motor insurance",
    "medical insurance", "two-wheeler", "two wheeler",
    "motorcycle", "scooter", "hospital", "surgery",
    "treatment", "burglary", "earthquake", "claim process",
    "how to claim", "settlement", "tax benefit", "tax saving",
    "80c", "80d", "section 80", "zero depreciation",
    "roadside assistance", "ncb", "idv",
    "commercial vehicle", "fleet insurance", "fleet",
    "public liability", "professional indemnity", "d&o",
    "directors and officers", "employer liability", "product liability",
    "marine cargo", "marine insurance", "business interruption",
    "cyber insurance", "fidelity guarantee", "credit insurance",
    "trade insurance", "crop insurance", "agriculture insurance",
    "livestock", "weather insurance", "pmfby", "kisan",
    "pmjjby", "pmsby", "microinsurance", "jan suraksha",
    "jeevan jyoti", "social security", "government scheme",
    "gadget insurance", "mobile insurance", "phone insurance",
    "pet insurance", "dog insurance", "event insurance",
    "wedding insurance", "parametric",
];

// Words that need word-boundary matching to avoid false positives
// (e.g. "policy" should match but "politics" should not)
const INSURANCE_WORD_KEYWORDS = [
    "policy", "cover", "rider", "maturity", "health", "medical",
    "doctor", "vehicle", "sedan", "suv", "motor", "bike",
    "travel", "flight", "abroad", "theft", "flood",
    "premium", "claim", "nominee",
];

// Conversational words (always allowed through)
const CONVERSATIONAL_WORDS = [
    "hi", "hello", "hey", "thanks", "thank", "bye", "goodbye",
    "help", "ok", "okay", "yes", "no", "sure", "yo",
];

/* ─── Category keyword map ───────────────────────────────────── */
const CATEGORY_KEYWORDS = {
    car: ["car", "vehicle", "auto", "motor", "drive", "sedan", "suv", "four-wheeler", "four wheeler"],
    bike: ["bike", "two-wheeler", "two wheeler", "motorcycle", "scooter", "ride", "moped"],
    health: ["health", "medical", "hospital", "doctor", "disease", "illness", "surgery", "treatment", "cashless", "family floater", "mediclaim", "hospitalization"],
    life: ["life", "term", "death", "nominee", "endowment", "maturity", "critical illness", "pension", "annuity", "whole life", "ulip"],
    travel: ["travel", "trip", "flight", "abroad", "international", "domestic", "vacation", "passport", "visa", "baggage"],
    home: ["home", "house", "property", "fire", "earthquake", "building", "burglary", "theft", "flood", "tenant", "landlord"],
    motor_commercial: ["commercial vehicle", "fleet", "truck", "goods vehicle", "taxi", "bus", "transport", "commercial motor", "tempo", "auto rickshaw"],
    liability: ["liability", "indemnity", "d&o", "directors and officers", "professional liability", "public liability", "employer liability", "product liability", "negligence"],
    business: ["marine", "cargo", "business interruption", "cyber insurance", "fidelity", "credit insurance", "trade insurance", "corporate insurance", "ransomware", "data breach"],
    agriculture: ["crop", "agriculture", "farming", "livestock", "cattle", "weather insurance", "pmfby", "farm equipment", "kisan", "harvest", "fasal"],
    micro_social: ["pmjjby", "pmsby", "microinsurance", "micro insurance", "government scheme", "jan suraksha", "jeevan jyoti", "social security", "rural insurance", "bpl"],
    specialty: ["gadget", "mobile insurance", "phone insurance", "pet insurance", "dog insurance", "cat insurance", "event insurance", "wedding insurance", "parametric"],
};

/* ─── Intent definitions ─────────────────────────────────────── */
const INTENT_PATTERNS = {
    greeting: {
        keywords: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy", "what's up", "sup"],
        exact: ["hi", "hello", "hey", "yo"],
    },
    farewell: {
        keywords: ["bye", "goodbye", "good bye", "see you", "take care", "cya"],
        exact: ["bye", "goodbye"],
    },
    thanks: {
        keywords: ["thank", "thanks", "thank you", "thx", "appreciate"],
        exact: ["thanks", "thx", "ty"],
    },
    claim_help: {
        keywords: ["claim", "file a claim", "claim process", "how to claim", "claim settlement", "claim status", "raise a claim", "submit claim", "claim form"],
    },
    premium_info: {
        keywords: ["premium", "price", "cost", "rate", "how much", "affordable", "cheap", "expensive", "calculate premium", "premium calculator", "emi", "payment"],
    },
    compare: {
        keywords: ["compare", "comparison", "versus", "vs", "difference between", "which is better", "best policy", "top policy"],
    },
    tax_benefits: {
        keywords: ["tax", "80c", "80d", "tax benefit", "tax saving", "tax deduction", "section 80", "income tax"],
    },
    policy_general: {
        keywords: ["what is insurance", "types of insurance", "why insurance", "need insurance", "importance of insurance", "how insurance works", "insurance basics", "explain insurance"],
    },
    buy_policy: {
        keywords: ["buy", "purchase", "get insurance", "take policy", "apply for", "enroll", "sign up", "interested in"],
    },
    recommend: {
        keywords: ["recommend", "suggest", "best", "top", "good policy", "which policy", "suitable", "right policy", "advise"],
    },
};

/* ─────────────────────────────────────────────────────────────
   Knowledge Base — Comprehensive Insurance Q&A
   ───────────────────────────────────────────────────────────── */
const KNOWLEDGE_BASE = {
    /* ── General Insurance ── */
    insurance_basics: {
        patterns: ["what is insurance", "explain insurance", "insurance meaning", "define insurance", "insurance basics"],
        response: `**Insurance** is a financial safety net — a contract between you and an insurance company where you pay a periodic **premium**, and in return the insurer promises to cover your financial losses from specified events.\n\n**How it works:**\n• You choose a policy type (health, life, car, etc.)\n• Pay a premium (monthly or annually)\n• If a covered event happens, the insurer pays your claim\n\n**Key terms:**\n• **Premium** — the amount you pay for coverage\n• **Sum Insured** — maximum amount the insurer will pay\n• **Deductible** — amount you pay before insurance kicks in\n• **Claim** — a formal request to the insurer for payment`,
        suggestedQuestions: ["What types of insurance are available?", "Why do I need insurance?", "How are premiums calculated?"],
    },

    insurance_types: {
        patterns: ["types of insurance", "kinds of insurance", "categories of insurance", "insurance options", "what insurance can i get"],
        response: `We offer **12 types of insurance** on InsureAI:\n\n**Popular Categories:**\n🏥 **Health Insurance** — Hospitalization, surgeries & medical expenses\n💙 **Life Insurance** — Financial protection for your family\n🚗 **Car Insurance** — Damage, theft & third-party liability\n🏍️ **Bike Insurance** — Two-wheeler protection\n✈️ **Travel Insurance** — Trip cancellation & medical emergencies\n🏠 **Home Insurance** — Property against fire, theft & disasters\n\n**Business & Commercial:**\n🚛 **Motor Commercial** — Trucks, fleets, taxis & commercial vehicles\n⚖️ **Liability Insurance** — Public, professional & D&O liability\n🏢 **Business Insurance** — Marine cargo, cyber & business interruption\n\n**Specialized:**\n🌾 **Agriculture Insurance** — Crop (PMFBY), livestock & weather\n🏛️ **Micro & Social** — PMJJBY, PMSBY & government schemes\n📱 **Specialty Insurance** — Gadget, pet & event/wedding\n\nWhich type interests you?`,
        suggestedQuestions: ["Tell me about health insurance", "What is PMJJBY?", "Tell me about cyber insurance"],
    },

    why_insurance: {
        patterns: ["why insurance", "need insurance", "importance of insurance", "benefits of insurance", "why should i buy insurance", "do i need insurance"],
        response: `**Why insurance matters:**\n\n1. **Financial Security** — Protects you from unexpected large expenses\n2. **Peace of Mind** — You know your family and assets are protected\n3. **Tax Benefits** — Premiums qualify for deductions under Section 80C & 80D\n4. **Legal Compliance** — Vehicle insurance is mandatory by law in India\n5. **Healthcare Access** — Health insurance gives access to cashless treatment\n6. **Family Protection** — Life insurance ensures your family's future\n\n💡 **Tip:** The earlier you buy, the lower your premiums will be!`,
        suggestedQuestions: ["How are premiums calculated?", "What types of insurance are available?", "Tell me about tax benefits"],
    },

    /* ── Premiums ── */
    premium_calculation: {
        patterns: ["how premium calculated", "premium calculation", "what affects premium", "premium factors", "how much does insurance cost", "how are premiums decided"],
        response: `**Insurance premiums depend on several factors:**\n\n**Health Insurance:**\n• Age (older = higher premium)\n• Pre-existing conditions\n• Sum insured amount\n• Family size (for floater plans)\n• City of residence\n\n**Life Insurance:**\n• Age and gender\n• Smoking/tobacco habits\n• Sum assured & policy term\n• Health history\n\n**Vehicle Insurance:**\n• Vehicle make, model & age\n• IDV (Insured Declared Value)\n• No Claim Bonus (NCB)\n• Add-ons selected\n• City of registration\n\n💡 Use our **Premium Calculator** in the app for an instant estimate!`,
        suggestedQuestions: ["What is No Claim Bonus (NCB)?", "What is IDV?", "How can I reduce my premium?"],
    },

    reduce_premium: {
        patterns: ["reduce premium", "lower premium", "save on insurance", "cheaper premium", "discount on insurance", "how to pay less"],
        response: `**Tips to reduce your insurance premium:**\n\n1. **No Claim Bonus (NCB)** — Don't make unnecessary claims; NCB gives up to 50% discount on renewal\n2. **Voluntary deductible** — Opt for a higher deductible to lower premium\n3. **Buy online** — Online policies are 5-10% cheaper than offline\n4. **Multi-year policies** — 2-3 year policies offer 7-10% discount\n5. **Compare before buying** — Use our Compare feature to find best rates\n6. **Healthy lifestyle** — Non-smokers get 15% lower life insurance premiums\n7. **Anti-theft devices** — Installing approved devices reduces vehicle premium\n8. **Start young** — Premiums are lowest when you're young and healthy`,
        suggestedQuestions: ["What is No Claim Bonus?", "How to compare policies?", "Tell me about health insurance"],
    },

    /* ── Claims ── */
    claim_process: {
        patterns: ["how to claim", "claim process", "file a claim", "make a claim", "raise claim", "submit claim", "claim procedure", "how to file claim"],
        response: `**General Claim Process:**\n\n1. **Intimate the insurer** — Report the incident via app, website, or helpline within 24-48 hours\n2. **Gather documents** — Policy copy, ID proof, incident details, photos, FIR (if applicable)\n3. **Fill claim form** — Submit the claim form with supporting documents\n4. **Surveyor inspection** — For vehicle/property claims, a surveyor assesses the damage\n5. **Claim approval** — Insurer reviews documents and approves/rejects the claim\n6. **Settlement** — Cashless settlement at network providers OR reimbursement of expenses\n\n**For your purchased policies**, go to **My Policies → Policy Details** to find the specific claim process and helpline numbers.\n\n⏱️ Most claims are settled within **7-30 working days** depending on the type.`,
        suggestedQuestions: ["What documents are needed for a claim?", "What is cashless claim?", "How long does claim settlement take?"],
    },

    cashless_claim: {
        patterns: ["cashless", "cashless claim", "cashless treatment", "cashless hospital", "what is cashless", "how cashless works"],
        response: `**Cashless Claims** mean you don't pay anything upfront — the insurer settles the bill directly with the service provider.\n\n**How it works:**\n1. Visit a **network hospital/garage** (listed by your insurer)\n2. Show your **health card or policy details** at reception\n3. The hospital/garage sends a **pre-authorization request** to the insurer\n4. Insurer **approves** the treatment/repair (usually within 2-4 hours)\n5. **Bills are settled directly** between the insurer and provider\n6. You only pay for non-covered items (if any)\n\n**Available for:**\n• 🏥 Health Insurance — at 9,000-14,000+ network hospitals\n• 🚗 Car Insurance — at 4,000-7,000+ network garages\n• 🏍️ Bike Insurance — at authorized workshops\n\n💡 Always check the network list before visiting!`,
        suggestedQuestions: ["How to file a reimbursement claim?", "What is pre-authorization?", "List of network hospitals"],
    },

    /* ── Tax Benefits ── */
    tax_benefits: {
        patterns: ["tax benefit", "tax saving", "tax deduction", "80c", "80d", "section 80", "income tax insurance", "tax exemption"],
        response: `**Insurance Tax Benefits in India:**\n\n📋 **Section 80C** (Life Insurance)\n• Premium paid on life/term insurance is deductible\n• Maximum deduction: **₹1.5 Lakh** per year\n• Applies to policies for self, spouse, and children\n\n📋 **Section 80D** (Health Insurance)\n• Premium for health insurance is deductible\n• Self & family: up to **₹25,000** (₹50,000 if senior citizen)\n• Parents: additional **₹25,000** (₹50,000 if senior)\n• Preventive health check-up: up to **₹5,000** (within 80D limit)\n\n📋 **Section 10(10D)** (Life Insurance Maturity)\n• Maturity proceeds are **tax-free** if premium ≤ 10% of sum assured\n\n💡 **Tip:** Buying health + life insurance can save you up to **₹1 Lakh** in taxes per year!`,
        suggestedQuestions: ["Tell me about life insurance", "Tell me about health insurance", "How are premiums calculated?"],
    },

    /* ── Key Terms ── */
    ncb: {
        patterns: ["ncb", "no claim bonus", "what is ncb", "no-claim bonus", "claim bonus"],
        response: `**No Claim Bonus (NCB)** is a reward for not making claims during a policy year.\n\n**How it works:**\n• If you don't file any claim in a year, you get a **discount on next year's premium**\n• NCB accumulates over years:\n  - After 1 claim-free year: **20% discount**\n  - After 2 years: **25%**\n  - After 3 years: **35%**\n  - After 4 years: **45%**\n  - After 5+ years: **50% discount**\n\n**Important:**\n• NCB belongs to the **owner**, not the vehicle\n• NCB is **lost** if you make a claim (unless you have NCB Protector add-on)\n• NCB is **transferable** to a new vehicle\n• Policy must be **renewed within 90 days** of expiry to retain NCB`,
        suggestedQuestions: ["How to reduce my premium?", "What is IDV?", "Tell me about car insurance"],
    },

    idv: {
        patterns: ["idv", "insured declared value", "what is idv", "idv meaning", "how idv calculated"],
        response: `**IDV (Insured Declared Value)** is the current market value of your vehicle — the maximum amount you'd receive if it's stolen or totaled.\n\n**How IDV is calculated:**\n• IDV = **Manufacturer's listed selling price – Depreciation**\n• Depreciation rates by vehicle age:\n  - < 6 months: **5%**\n  - 6-12 months: **15%**\n  - 1-2 years: **20%**\n  - 2-3 years: **30%**\n  - 3-4 years: **40%**\n  - 4-5 years: **50%**\n\n**Why it matters:**\n• Higher IDV = higher premium but better payout\n• Lower IDV = lower premium but less coverage\n• Don't set IDV too low — you'll be underinsured\n\n💡 **Tip:** Keep IDV close to actual market value for adequate protection.`,
        suggestedQuestions: ["What is NCB?", "Tell me about car insurance", "How to reduce premium?"],
    },

    waiting_period: {
        patterns: ["waiting period", "what is waiting period", "how long waiting period", "pre-existing waiting"],
        response: `**Waiting Period** is the initial time after buying a policy during which certain claims are not payable.\n\n**Types of waiting periods:**\n\n⏳ **Initial Waiting Period** — 30 days\n• No claims allowed in first 30 days (except accidents)\n\n⏳ **Specific Disease Waiting** — 2 years\n• Conditions like hernia, kidney stones, cataracts, joint replacement\n\n⏳ **Pre-Existing Disease (PED)** — 2-4 years\n• Conditions you had before buying the policy\n• Diabetes, hypertension, thyroid, etc.\n\n⏳ **Maternity Waiting** — 9 months to 3 years\n• Depends on the insurer and plan\n\n💡 **Tip:** Buy health insurance early to finish waiting periods while you're healthy!`,
        suggestedQuestions: ["Tell me about health insurance", "What are pre-existing diseases?", "How to file a claim?"],
    },

    /* ── Category: Health Insurance ── */
    health_general: {
        patterns: ["health insurance", "medical insurance", "health policy", "health cover", "mediclaim", "tell me about health"],
        response: `**Health Insurance** covers your medical and hospitalization expenses.\n\n**What's covered:**\n• 🏥 In-patient hospitalization (room, ICU, surgery)\n• 💊 Pre & post hospitalization expenses\n• 🩺 Day-care procedures (580+ procedures)\n• 🚑 Ambulance charges\n• 🧘 AYUSH treatments (Ayurveda, Yoga, Homeopathy)\n\n**Types available:**\n• **Individual Plan** — Covers one person\n• **Family Floater** — Covers entire family under one sum insured\n• **Senior Citizen** — Designed for ages 60+\n• **Critical Illness** — Lump sum on diagnosis of specific illnesses\n\n**Our top health plans** start from just **₹14,900/year** with coverage up to **₹15 Lakh**!\n\nWant me to show you our health insurance options?`,
        suggestedQuestions: ["Show health insurance policies", "What is cashless claim?", "What about waiting periods?"],
    },

    /* ── Category: Life Insurance ── */
    life_general: {
        patterns: ["life insurance", "term insurance", "life policy", "life cover", "tell me about life", "term plan", "term life"],
        response: `**Life Insurance** provides financial protection to your family in case of your untimely death.\n\n**Types of life insurance:**\n• **Term Plan** — Pure protection, highest cover at lowest cost (no maturity benefit)\n• **Endowment Plan** — Life cover + savings (maturity benefit)\n• **ULIP** — Life cover + market-linked investment\n• **Whole Life** — Coverage for entire lifetime\n• **Money Back** — Periodic payouts during policy term\n\n**Key benefits:**\n• 💰 Financial security for your family\n• 📋 Tax benefits under Section 80C & 10(10D)\n• 🏥 Critical illness rider available\n• ⚡ Accidental death benefit add-on\n\n**Our plans** start from **₹9,800/year** with coverage up to **₹2 Crore**!\n\nWould you like to see our life insurance policies?`,
        suggestedQuestions: ["Show life insurance policies", "Term vs endowment — what's better?", "Tax benefits of life insurance"],
    },

    term_vs_endowment: {
        patterns: ["term vs endowment", "term or endowment", "difference term endowment", "which is better term"],
        response: `**Term Plan vs Endowment Plan:**\n\n| Feature | Term Plan | Endowment Plan |\n|---------|-----------|----------------|\n| **Premium** | Very low (₹500-1,500/month) | Higher (₹3,000-10,000/month) |\n| **Coverage** | Very high (₹1-2 Cr) | Moderate (₹10-50 Lakh) |\n| **Maturity Benefit** | ❌ None | ✅ Sum + bonuses |\n| **Death Benefit** | ✅ Full sum assured | ✅ Sum + bonuses |\n| **Best For** | Pure protection | Protection + savings |\n| **Ideal Age** | 25-40 years | 25-45 years |\n\n💡 **Expert recommendation:** If you want maximum protection, choose a **Term Plan**. If you also want savings, add an **Endowment Plan** on top.`,
        suggestedQuestions: ["Show life insurance policies", "Tell me about tax benefits", "What is critical illness cover?"],
    },

    /* ── Category: Car Insurance ── */
    car_general: {
        patterns: ["car insurance", "vehicle insurance", "motor insurance", "auto insurance", "tell me about car"],
        response: `**Car Insurance** protects your vehicle against damage, theft, and third-party liability.\n\n**Types:**\n• **Comprehensive** — Own damage + third-party liability (recommended)\n• **Third-Party Only** — Covers only damage to others (mandatory by law)\n• **Standalone OD** — Only own damage cover\n\n**What's covered:**\n• 🚗 Accidents, collisions & overturning\n• 🔥 Fire and explosion\n• 🌊 Natural calamities (flood, earthquake, storm)\n• 🔒 Theft of vehicle\n• ⚖️ Third-party injury/death liability\n• 🛠️ Cashless repairs at 4,000-7,000+ garages\n\n**Popular add-ons:** Zero depreciation, engine protector, roadside assistance, NCB protector, return to invoice\n\n**Our plans** start from **₹6,800/year** with coverage up to **₹8.5 Lakh**!`,
        suggestedQuestions: ["Show car insurance policies", "What is IDV?", "What is zero depreciation?"],
    },

    zero_dep: {
        patterns: ["zero depreciation", "zero dep", "nil depreciation", "bumper to bumper"],
        response: `**Zero Depreciation (Bumper-to-Bumper) Cover** ensures you get the **full claim amount** without any deduction for parts depreciation.\n\n**Without zero dep:**\n• Insurer deducts depreciation on rubber, plastic, fiber, and glass parts\n• You may get only 60-70% of repair cost\n\n**With zero dep:**\n• **100% of repair cost** is covered\n• No depreciation deduction on any part\n• You pay only the compulsory deductible\n\n**Who should buy it?**\n• ✅ New car owners (first 5 years)\n• ✅ Expensive/luxury vehicles\n• ✅ First-time drivers\n• ✅ City drivers (higher accident risk)\n\n**Cost:** Adds about 15-20% to your premium.\n\n💡 **Tip:** Absolutely worth it for cars under 5 years old!`,
        suggestedQuestions: ["Tell me about car insurance", "What is NCB?", "Show car insurance policies"],
    },

    /* ── Category: Bike Insurance ── */
    bike_general: {
        patterns: ["bike insurance", "two wheeler insurance", "two-wheeler insurance", "motorcycle insurance", "scooter insurance", "tell me about bike"],
        response: `**Bike Insurance** (Two-Wheeler Insurance) protects your motorcycle or scooter.\n\n**Types:**\n• **Comprehensive** — Own damage + third-party (recommended)\n• **Third-Party Only** — Mandatory by law, covers only others' damages\n\n**What's covered:**\n• 🏍️ Accidents and collisions\n• 🔥 Fire and explosion\n• 🔒 Theft of vehicle\n• 🌧️ Natural & man-made calamities\n• ⚖️ Third-party injury/death/property damage\n• 👤 Personal accident cover for owner-rider (₹15 Lakh)\n\n**Popular add-ons:** Zero depreciation, engine protector, roadside assistance, pillion rider cover\n\n**Our plans** start from just **₹1,599/year** with coverage up to **₹2 Lakh**!\n\n⚠️ Driving without at least third-party insurance is **illegal** and attracts a fine of ₹2,000!`,
        suggestedQuestions: ["Show bike insurance policies", "Is bike insurance mandatory?", "What is NCB?"],
    },

    /* ── Category: Travel Insurance ── */
    travel_general: {
        patterns: ["travel insurance", "trip insurance", "flight insurance", "travel cover", "tell me about travel", "going abroad"],
        response: `**Travel Insurance** covers unexpected events during your domestic or international trips.\n\n**What's covered:**\n• 🏥 Emergency medical treatment abroad\n• 🚑 Medical evacuation & repatriation\n• ✈️ Trip cancellation/delay/interruption\n• 🧳 Baggage loss, delay, or damage\n• 📄 Passport loss assistance\n• ⚖️ Personal liability coverage\n• 🏔️ Adventure sports (on select plans)\n\n**Types:**\n• **Single Trip** — For one specific journey\n• **Multi-Trip Annual** — Covers all trips in a year (saves 40%!)\n• **Student Travel** — For study abroad\n• **Domestic** — Within India coverage\n\n**Our plans** start from **₹1,200** per trip!\n\n💡 **Tip:** Many countries (Schengen, UAE, etc.) **require** travel insurance for visa approval.`,
        suggestedQuestions: ["Show travel insurance policies", "Is travel insurance mandatory for visa?", "What does travel insurance not cover?"],
    },

    /* ── Category: Home Insurance ── */
    home_general: {
        patterns: ["home insurance", "house insurance", "property insurance", "home cover", "tell me about home"],
        response: `**Home Insurance** protects your house structure and contents against damage, disasters, and theft.\n\n**What's covered:**\n• 🏠 Building structure (walls, roof, foundation)\n• 🪑 Home contents (furniture, appliances, electronics)\n• 🔥 Fire and explosion\n• 🌊 Flood, storm, and natural disasters\n• 🔒 Burglary and theft\n• 💎 Valuables (jewellery, art — add-on)\n• 🏨 Temporary accommodation if home is uninhabitable\n\n**Types:**\n• **Structure Only** — Covers the building\n• **Contents Only** — Covers belongings\n• **Comprehensive** — Structure + contents (recommended)\n• **Tenant Insurance** — For renters (covers belongings only)\n\n**Our plans** start from **₹2,900/year** with coverage up to **₹40 Lakh**!`,
        suggestedQuestions: ["Show home insurance policies", "I'm a tenant — which plan?", "Does home insurance cover earthquake?"],
    },

    /* ── Category: Motor Commercial Insurance ── */
    motor_commercial_general: {
        patterns: ["commercial vehicle insurance", "fleet insurance", "truck insurance", "taxi insurance", "commercial motor", "transport insurance", "goods vehicle"],
        response: `**Motor Commercial Insurance** covers trucks, buses, taxis, autos, tempos, and fleet vehicles.\n\n**Types:**\n• **Comprehensive** — Own damage + third-party liability\n• **Third-Party Only** — Mandatory under Motor Vehicles Act\n• **Fleet Policy** — Single policy covering multiple vehicles\n\n**What's covered:**\n• 🚛 Third-party bodily injury/death liability (unlimited)\n• 🔧 Own damage from accidents, fire, theft\n• 👨‍✈️ Personal accident for driver & cleaner\n• 📦 Goods in transit damage\n\n**Key points:**\n• Third-party insurance is **mandatory** for all commercial vehicles\n• NCB available up to 50% for claim-free years\n• Fleet discounts of 15-20% for 5+ vehicles\n\nWant to see our commercial vehicle insurance plans?`,
        suggestedQuestions: ["Show commercial vehicle policies", "Is commercial vehicle insurance mandatory?", "What is fleet insurance?"],
    },

    /* ── Category: Liability Insurance ── */
    liability_general: {
        patterns: ["liability insurance", "public liability", "professional indemnity", "d&o insurance", "directors and officers", "employer liability"],
        response: `**Liability Insurance** protects you against legal claims from third parties.\n\n**Types:**\n• ⚖️ **Public Liability** — Claims from public for injury/property damage\n• 🏥 **Professional Indemnity** — Negligence claims against professionals (doctors, CAs, lawyers)\n• 👔 **Directors & Officers (D&O)** — Protects company directors from wrongful act claims\n• 🏭 **Employer's Liability** — Workplace injury claims from employees\n• 📦 **Product Liability** — Claims from defective products\n\n**Why it matters:**\n• Public Liability Act 1991 mandates PL insurance for hazardous industries\n• Professional bodies recommend PI insurance for all practitioners\n• D&O insurance is essential for listed companies\n\nWant me to show you our liability insurance options?`,
        suggestedQuestions: ["Show liability policies", "Who needs professional indemnity?", "What is D&O insurance?"],
    },

    /* ── Category: Business Insurance ── */
    business_general: {
        patterns: ["business insurance", "commercial insurance", "marine insurance", "cargo insurance", "cyber insurance", "business interruption"],
        response: `**Business Insurance** protects your company's operations, assets, and digital infrastructure.\n\n**Types:**\n• 🚢 **Marine Cargo** — Goods in transit by sea, air, rail, road\n• 💻 **Cyber Insurance** — Data breaches, ransomware, business interruption\n• 🏭 **Business Interruption** — Revenue loss from insured perils\n• 🔒 **Fidelity Guarantee** — Employee dishonesty protection\n• 💳 **Credit Insurance** — Buyer default risk\n\n**Key stats:**\n• Cyber attacks cost Indian businesses **₹17 Cr** on average\n• Marine insurance covers **₹100+ Cr** in trade daily\n• BI insurance can cover up to **12 months** of lost revenue\n\nWant to explore our business insurance plans?`,
        suggestedQuestions: ["Show cyber insurance policies", "What is marine cargo insurance?", "How does business interruption work?"],
    },

    /* ── Category: Agriculture Insurance ── */
    agriculture_general: {
        patterns: ["agriculture insurance", "crop insurance", "farming insurance", "pmfby", "livestock insurance", "kisan insurance", "fasal bima"],
        response: `**Agriculture Insurance** protects farmers against crop failure, livestock loss, and weather risks.\n\n**Types:**\n• 🌾 **Crop Insurance (PMFBY)** — Govt-subsidized, farmer pays only 2% (Kharif) / 1.5% (Rabi)\n• 🐄 **Livestock Insurance** — Death of cattle, buffalo, sheep, goat from disease/accident\n• 🌧️ **Weather Insurance** — Parametric payouts based on weather index\n• 🚜 **Farm Equipment** — Tractor and machinery breakdown\n\n**PMFBY Highlights:**\n• Premium: Farmer pays only **2% Kharif, 1.5% Rabi** (govt subsidizes rest)\n• Coverage: Full sum insured based on threshold yield\n• Claims: **Auto-processed** via satellite data — no individual filing needed\n• Available through: Banks, CSCs, and insurance companies\n\nWant to see our agriculture insurance plans?`,
        suggestedQuestions: ["Show crop insurance policies", "How does PMFBY work?", "What is livestock insurance?"],
    },

    /* ── Category: Micro & Social Insurance ── */
    micro_social_general: {
        patterns: ["pmjjby", "pmsby", "government insurance", "jan suraksha", "jeevan jyoti", "suraksha bima", "government scheme insurance", "microinsurance"],
        response: `**Government Insurance Schemes** provide affordable coverage for all Indians.\n\n**Key Schemes:**\n• 💙 **PMJJBY** (Pradhan Mantri Jeevan Jyoti Bima Yojana)\n  - Life cover: **₹2 Lakh** for death from any cause\n  - Premium: Only **₹436/year** (auto-debit)\n  - Age: 18-50 years\n\n• ⚡ **PMSBY** (Pradhan Mantri Suraksha Bima Yojana)\n  - Accidental death: **₹2 Lakh**\n  - Partial disability: **₹1 Lakh**\n  - Premium: Only **₹20/year** — world's cheapest!\n  - Age: 18-70 years\n\n**How to enroll:**\n1. Visit your bank branch or net banking\n2. Link Aadhaar to your savings account\n3. Opt-in for PMJJBY/PMSBY\n4. Premium auto-debited annually\n\n💡 **Tip:** Both schemes together cost only **₹456/year** for ₹4 Lakh total cover!`,
        suggestedQuestions: ["How to enroll in PMJJBY?", "Show government scheme policies", "What is the difference between PMJJBY and PMSBY?"],
    },

    /* ── Category: Specialty Insurance ── */
    specialty_general: {
        patterns: ["gadget insurance", "mobile insurance", "phone insurance", "pet insurance", "event insurance", "wedding insurance", "specialty insurance"],
        response: `**Specialty Insurance** covers modern lifestyle needs beyond traditional categories.\n\n**Types:**\n• 📱 **Gadget/Mobile Insurance** — Accidental damage, screen crack, liquid damage, theft\n• 🐕 **Pet Insurance** — Vet treatment, surgery, third-party liability, theft\n• 🎉 **Event/Wedding Insurance** — Cancellation, vendor no-show, weather disruption\n• 🌡️ **Parametric Insurance** — Auto-payout triggered by weather data (no claim process!)\n\n**Key highlights:**\n• Gadget insurance: From **₹2,999/year** for phones up to ₹1.5L\n• Pet insurance: From **₹5,500/year** for dogs and cats\n• Wedding insurance: From **₹8,000** per event\n\nThese are India's fastest growing insurance segments! Want details?`,
        suggestedQuestions: ["Show gadget insurance options", "Tell me about pet insurance", "How does event insurance work?"],
    },

    /* ── Comparison ── */
    how_to_compare: {
        patterns: ["compare policies", "how to compare", "policy comparison", "compare insurance", "which policy is better"],
        response: `**How to compare insurance policies:**\n\n1. **Go to our Compare page** — Select up to 3 policies side by side\n2. **Key factors to compare:**\n   • 💰 **Premium** — Annual cost\n   • 🛡️ **Coverage** — Sum insured amount\n   • ⭐ **Claim Settlement Ratio** — Higher is better\n   • 🏥 **Network** — Number of hospitals/garages\n   • 📋 **Exclusions** — What's NOT covered\n   • ➕ **Add-ons** — Available riders and extras\n   • ⏳ **Waiting Period** — For health insurance\n   • 📊 **NCB** — For vehicle insurance\n\n💡 **Pro tip:** Don't just pick the cheapest policy — focus on coverage quality and claim settlement experience!\n\nWant me to recommend policies for a specific category?`,
        suggestedQuestions: ["Recommend health insurance", "Show car insurance policies", "What is claim settlement ratio?"],
    },

    /* ── Buy Process ── */
    how_to_buy: {
        patterns: ["how to buy", "buy insurance", "purchase insurance", "buy policy", "get insured", "apply for insurance", "steps to buy"],
        response: `**How to buy insurance on InsureAI:**\n\n1. **Browse policies** — Go to our Policies page and filter by category\n2. **Compare options** — Use Compare feature to evaluate up to 3 policies\n3. **Check details** — Click on a policy to see coverage, benefits, and terms\n4. **Calculate premium** — Use the Premium Calculator for a personalized quote\n5. **Purchase** — Click "Buy Now" and complete the payment\n6. **Get policy document** — Instant digital policy via email\n\n💡 **Tips:**\n• Use our AI Recommendations for personalized suggestions\n• Read the terms & conditions carefully\n• Declare all pre-existing conditions honestly\n• Keep digital copies of all documents`,
        suggestedQuestions: ["Recommend a policy for me", "How are premiums calculated?", "What documents do I need?"],
    },
};

/* ─────────────────────────────────────────────────────────────
   Helper: detect intent from message
   ───────────────────────────────────────────────────────────── */
function detectIntent(text) {
    const lower = text.toLowerCase().trim();

    // Check exact matches first (for greetings etc.)
    for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
        if (config.exact?.includes(lower)) return intent;
    }

    // Score each intent by keyword matches
    let bestIntent = null;
    let bestScore = 0;

    for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
        let score = 0;
        for (const kw of config.keywords) {
            if (lower.includes(kw)) score += kw.split(" ").length; // multi-word keywords score higher
        }
        if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
        }
    }

    return bestIntent;
}

/* ─────────────────────────────────────────────────────────────
   Helper: detect categories mentioned
   ───────────────────────────────────────────────────────────── */
function detectCategories(text) {
    const lower = text.toLowerCase();
    const matches = new Set();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const kw of keywords) {
            if (lower.includes(kw)) { matches.add(cat); break; }
        }
    }
    return [...matches];
}

/* ─────────────────────────────────────────────────────────────
   Helper: search knowledge base for best match
   Only uses full phrase matching — no partial word overlap
   ───────────────────────────────────────────────────────────── */
function searchKnowledgeBase(text) {
    const lower = text.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, entry] of Object.entries(KNOWLEDGE_BASE)) {
        let score = 0;
        for (const pattern of entry.patterns) {
            // Only count full phrase matches
            if (lower.includes(pattern)) {
                score += pattern.split(" ").length * 3;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = { key, ...entry };
        }
    }

    // Require a meaningful match (at least one full phrase)
    return bestScore >= 3 ? bestMatch : null;
}

/* ─────────────────────────────────────────────────────────────
   Helper: check if message is insurance-related (guardrail)
   Uses strict keyword matching to reject off-topic questions
   ───────────────────────────────────────────────────────────── */
function isInsuranceRelated(text) {
    const lower = text.toLowerCase().trim();
    const words = lower.split(/\s+/);

    // Allow very short messages (1-3 words) — likely greetings or simple queries
    if (words.length <= 3) {
        if (CONVERSATIONAL_WORDS.some(g => lower === g || words.includes(g))) return true;
    }

    // Check multi-word phrase keywords (simple includes)
    for (const kw of INSURANCE_PHRASE_KEYWORDS) {
        if (lower.includes(kw)) return true;
    }

    // Check single-word keywords with word-boundary matching
    for (const kw of INSURANCE_WORD_KEYWORDS) {
        const regex = new RegExp(`\\b${kw}\\b`, "i");
        if (regex.test(lower)) return true;
    }

    return false;
}

/* ─────────────────────────────────────────────────────────────
   Helper: fetch policy recommendations from DB
   ───────────────────────────────────────────────────────────── */
async function getRecommendations(categories, limit = 3) {
    if (!categories.length) return [];
    const policies = await Policy.find({ category: { $in: categories } })
        .sort({ score: -1 })
        .limit(limit)
        .lean();

    return policies.map(p => ({
        ...p,
        id: p.policyId || p._id,
    }));
}

/* ═════════════════════════════════════════════════════════════
   Main: process chat message
   ═════════════════════════════════════════════════════════════ */
export async function processMessage(message, history = []) {
    const text = message.trim();
    if (!text) {
        return {
            reply: "Please type a question about insurance — I'm here to help! 😊",
            recommendations: [],
            suggestedQuestions: ["What types of insurance are available?", "How to file a claim?", "Compare policies"],
        };
    }

    /* ── Google Gemini LLM Integration ── */
    if (process.env.GEMINI_API_KEY) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            
            const systemPrompt = `You are the "InsureAI Assistant", a helpful, polite, and deeply knowledgeable insurance chatbot exclusive to the InsureAI platform. 
Your sole purpose is to help users with insurance-related questions. 
STRICT GUARDRAIL: You MUST forcefully but politely decline to answer ANY question that is not directly related to insurance, policies, claims, premiums, or the InsureAI platform. Do not write code, do not give cooking recipes, do not answer general knowledge questions. If the user asks something off-topic, reply with an apology and guide them back to insurance topics.`;

            // Prepare history for Gemini
            // Gemini roles: 'user' or 'model'
            const contents = [];
            for (const msg of history) {
                contents.push({
                    role: msg.role === "bot" ? "model" : "user",
                    parts: [{ text: msg.message || msg.content || String(msg) }]
                });
            }
            // Add current message
            contents.push({ role: "user", parts: [{ text }] });

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.1, // Low temperature for factual, strictly bounded responses
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            reply: {
                                type: Type.STRING,
                                description: "Your markdown-formatted conversational response to the user. Must politely decline non-insurance queries."
                            },
                            categories: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: "Array of matching categories if the user is explicitly asking for policy recommendations. Valid categories: 'car', 'bike', 'health', 'life', 'travel', 'home', 'motor_commercial', 'liability', 'business', 'agriculture', 'micro_social', 'specialty'."
                            },
                            suggestedQuestions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: "3 relevant follow-up questions the user might ask about insurance."
                            }
                        },
                        required: ["reply", "categories", "suggestedQuestions"]
                    }
                }
            });

            if (response.text) {
                const parsedResult = JSON.parse(response.text);

                let recommendations = [];
                if (parsedResult.categories && Array.isArray(parsedResult.categories) && parsedResult.categories.length > 0) {
                    recommendations = await getRecommendations(parsedResult.categories);
                }

                return {
                    reply: parsedResult.reply || "I am here to help with your insurance needs.",
                    recommendations: recommendations,
                    suggestedQuestions: Array.isArray(parsedResult.suggestedQuestions) ? parsedResult.suggestedQuestions.slice(0, 3) : ["What types of insurance are available?", "How are premiums calculated?"]
                };
            }
        } catch (error) {
            console.error("Gemini AI failed, using fallback:", error.message);
        }
    }

    /* ── Insurance-only guardrail (Legacy Fallback) ── */
    if (!isInsuranceRelated(text)) {
        return {
            reply: "I appreciate your question, but I'm specifically designed to help with **insurance-related topics only**. 🛡️\n\nI can assist you with:\n• Finding the right insurance policy\n• Understanding coverage, premiums & claims\n• Comparing policies across categories\n• Tax benefits and insurance tips\n\nHow can I help you with insurance today?",
            recommendations: [],
            suggestedQuestions: ["What types of insurance are available?", "How are premiums calculated?", "How to file a claim?"],
        };
    }

    /* ── Intent detection ── */
    const intent = detectIntent(text);
    const categories = detectCategories(text);

    /* ── Greeting ── */
    if (intent === "greeting") {
        return {
            reply: "Hello! 👋 I'm your **InsureAI Assistant**. I can help you find the perfect insurance policy, understand coverage details, file claims, and much more!\n\nWhat would you like to know about insurance?",
            recommendations: [],
            suggestedQuestions: ["What types of insurance are available?", "I need health insurance", "How to file a claim?"],
        };
    }

    /* ── Farewell ── */
    if (intent === "farewell") {
        return {
            reply: "Goodbye! 👋 If you need help with insurance in the future, I'm always here. Stay insured, stay secure! 🛡️",
            recommendations: [],
            suggestedQuestions: [],
        };
    }

    /* ── Thanks ── */
    if (intent === "thanks") {
        return {
            reply: "You're welcome! 😊 I'm happy to help. If you have more questions about insurance, don't hesitate to ask!",
            recommendations: [],
            suggestedQuestions: ["What types of insurance are available?", "Compare policies", "How to buy insurance?"],
        };
    }

    /* ── Knowledge base search (most specific) ── */
    const kbMatch = searchKnowledgeBase(text);

    /* ── Category-specific with policy recommendations ── */
    if (categories.length > 0) {
        const recommendations = await getRecommendations(categories);

        // If we also found a knowledge base match, use that response
        if (kbMatch) {
            return {
                reply: kbMatch.response,
                recommendations,
                suggestedQuestions: kbMatch.suggestedQuestions || [],
            };
        }

        // Category-specific query without KB match — show policies
        const catNames = categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(" & ");
        const policyList = recommendations.map(p => `• **${p.name}** by ${p.company} — ₹${p.price.toLocaleString("en-IN")}/year (Coverage: ₹${p.coverage.toLocaleString("en-IN")})`).join("\n");

        let reply;
        if (intent === "recommend" || intent === "buy_policy") {
            reply = `Here are the **top ${catNames} insurance** plans I'd recommend:\n\n${policyList}\n\n📊 You can compare these side-by-side on our **Compare Policies** page for a detailed breakdown!`;
        } else {
            reply = `Here are our **best ${catNames} insurance** options:\n\n${policyList}\n\nWould you like more details about any of these, or shall I help you compare them?`;
        }

        return {
            reply,
            recommendations,
            suggestedQuestions: [
                `Tell me about ${categories[0]} insurance`,
                "Compare these policies",
                "How are premiums calculated?",
            ],
        };
    }

    /* ── Pure knowledge base match (no category) ── */
    if (kbMatch) {
        return {
            reply: kbMatch.response,
            recommendations: [],
            suggestedQuestions: kbMatch.suggestedQuestions || [],
        };
    }

    /* ── Intent-based fallbacks ── */
    if (intent === "claim_help") {
        const entry = KNOWLEDGE_BASE.claim_process;
        return { reply: entry.response, recommendations: [], suggestedQuestions: entry.suggestedQuestions };
    }

    if (intent === "premium_info") {
        const entry = KNOWLEDGE_BASE.premium_calculation;
        return { reply: entry.response, recommendations: [], suggestedQuestions: entry.suggestedQuestions };
    }

    if (intent === "compare") {
        const entry = KNOWLEDGE_BASE.how_to_compare;
        return { reply: entry.response, recommendations: [], suggestedQuestions: entry.suggestedQuestions };
    }

    if (intent === "tax_benefits") {
        const entry = KNOWLEDGE_BASE.tax_benefits;
        return { reply: entry.response, recommendations: [], suggestedQuestions: entry.suggestedQuestions };
    }

    if (intent === "buy_policy") {
        const entry = KNOWLEDGE_BASE.how_to_buy;
        return { reply: entry.response, recommendations: [], suggestedQuestions: entry.suggestedQuestions };
    }

    if (intent === "recommend") {
        return {
            reply: "I'd love to recommend the best insurance for you! 🎯\n\nTo give you the right recommendation, could you tell me what type of insurance you're looking for?\n\n**Personal:**\n• 🏥 **Health** — Medical & hospitalization\n• 💙 **Life** — Term & endowment plans\n• 🚗 **Car** — Vehicle protection\n• 🏍️ **Bike** — Two-wheeler cover\n• ✈️ **Travel** — Trip protection\n• 🏠 **Home** — Property & contents\n\n**Business & Specialized:**\n• 🚛 **Commercial Motor** — Fleet & trucks\n• ⚖️ **Liability** — Public, professional\n• 🏢 **Business** — Marine, cyber, BI\n• 🌾 **Agriculture** — Crop, livestock\n• 🏛️ **Govt Schemes** — PMJJBY, PMSBY\n• 📱 **Specialty** — Gadget, pet, event",
            recommendations: [],
            suggestedQuestions: ["I need health insurance", "Show cyber insurance options", "Tell me about PMJJBY"],
        };
    }

    if (intent === "policy_general") {
        const entry = KNOWLEDGE_BASE.insurance_basics;
        return { reply: entry.response, recommendations: [], suggestedQuestions: entry.suggestedQuestions };
    }

    /* ── Generic insurance fallback ── */
    return {
        reply: "I can help you with that! Here's what I can assist you with:\n\n• 🔍 **Find policies** — Browse health, life, car, bike, travel & home insurance\n• 💰 **Premium info** — Understand costs and how to save\n• 📋 **Claims** — Learn the claim process\n• 📊 **Compare** — Side-by-side policy comparison\n• 🧾 **Tax benefits** — Section 80C, 80D deductions\n• 📖 **Insurance basics** — Key terms and concepts\n\nTry asking me something specific, like \"Tell me about health insurance\" or \"How to file a claim?\"",
        recommendations: [],
        suggestedQuestions: ["What types of insurance are available?", "I need health insurance", "How to file a claim?"],
    };
}
