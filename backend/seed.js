import "dotenv/config";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Policy from "./src/domains/policies/models/Policy.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const newPolicies = JSON.parse(readFileSync(join(__dirname, "scripts", "newPolicies.json"), "utf-8"));
const insurancePlans = JSON.parse(readFileSync(join(__dirname, "scripts", "insurancePlans.json"), "utf-8"));

/* Auto-assign segment & subtype to existing policies based on category */
const SEGMENT_MAP = { car: "general", bike: "general", health: "health", life: "life", travel: "general", home: "general" };
const SUBTYPE_MAP = { car: "comprehensive_car", bike: "comprehensive_bike", health: "individual_health", life: "term_life", travel: "international_travel", home: "home_structure" };

const policies = [
    // ─── CAR ───
    {
        policyId: "fe-car-1",
        name: "Motor Complete Guard",
        company: "Bajaj Allianz",
        price: 7200,
        coverage: 600000,
        category: "car",
        description: "Comprehensive car insurance policy with zero depreciation add-on and 24x7 roadside assistance. Ideal for new vehicles up to 5 years old.",
        benefits: ["Third-party + own damage cover", "Zero depreciation and engine protect add-ons", "24x7 roadside assistance across India", "Cashless repairs at 4000+ network garages"],
        coverageDetails: [
            { label: "Own Damage", value: "Up to IDV (Insured Declared Value)" },
            { label: "Third-Party Liability", value: "Unlimited for death/injury" },
            { label: "Personal Accident", value: "₹15 Lakh for owner-driver" },
            { label: "Fire & Theft", value: "Full coverage" },
            { label: "Natural Calamities", value: "Flood, earthquake, storm included" },
        ],
        premiumInfo: { basePremium: "₹5,200/year", gst: "18% applicable", discounts: "Up to 50% NCB, anti-theft discount, voluntary deductible", paymentOptions: "Annual, Semi-annual, EMI via credit card" },
        eligibility: ["Vehicle must be registered in India", "Owner must have a valid driving license", "Vehicles aged up to 15 years eligible", "Both individual and corporate ownership accepted", "No mandatory pre-inspection for vehicles under 5 years"],
        termsAndConditions: ["Policy is valid for 12 months from the date of issuance", "Claims must be reported within 48 hours of the incident", "Coverage does not apply if driver is intoxicated or unlicensed", "Modifications to the vehicle must be declared and endorsed", "Depreciation applies to rubber, plastic, and glass parts unless zero-dep add-on is selected", "Policy renewal must be done before expiry to retain NCB benefits"],
        claimProcess: ["Intimate the claim via the Bajaj Allianz app or toll-free number 1800-209-5858", "Provide FIR copy (for theft/accident) and photographs of the vehicle", "Get the vehicle inspected by an authorized surveyor", "Choose cashless repair at a network garage or submit bills for reimbursement", "Claim is settled within 7-10 working days after document verification"],
        score: 87, reviewsCount: 19, ratingAverage: 4.5,
    },
    {
        policyId: "fe-car-2",
        name: "DriveSure Premium",
        company: "TATA AIG",
        price: 8100,
        coverage: 700000,
        category: "car",
        description: "Private car policy with theft, fire, natural calamity protection and return-to-invoice cover. Best suited for premium segment vehicles.",
        benefits: ["Return to invoice add-on", "Key replacement and consumables cover", "Quick claim intimation via app", "No claim bonus retention up to 50%"],
        coverageDetails: [
            { label: "Own Damage", value: "Up to IDV" },
            { label: "Third-Party Liability", value: "As per Motor Vehicle Act" },
            { label: "RTI Cover", value: "Invoice value minus registration charges" },
            { label: "Consumables", value: "Nuts, bolts, oil, coolant covered" },
            { label: "Key Replacement", value: "Up to ₹5,000 per claim" },
        ],
        premiumInfo: { basePremium: "₹6,500/year", gst: "18% applicable", discounts: "NCB up to 50%, automobile association member discount", paymentOptions: "Annual, EMI options available" },
        eligibility: ["Privately owned four-wheelers registered in India", "Vehicle not used for commercial purposes", "Previous insurance history required for renewal", "Vehicles up to 10 years old for comprehensive cover"],
        termsAndConditions: ["RTI add-on available only for vehicles below 5 years", "Consequential damage not covered unless engine protector is added", "Voluntary deductible chosen reduces premium but increases out-of-pocket", "Drink-and-drive incidents void the claim", "Geographic coverage limited to India, Nepal, Bhutan, Sri Lanka, and Maldives"],
        claimProcess: ["Register claim on the TATA AIG mobile app or call 1800-266-7780", "Upload photos, RC copy, and driving license via the portal", "Surveyor inspection scheduled within 24 hours of claim", "Cashless settlement at 5000+ preferred garages", "Reimbursement claims settled within 14 working days"],
        score: 85, reviewsCount: 11, ratingAverage: 4.2,
    },
    {
        policyId: "fe-car-3",
        name: "Auto Shield Pro",
        company: "HDFC ERGO",
        price: 6800,
        coverage: 550000,
        category: "car",
        description: "Budget-friendly car insurance with essential coverage and personal accident cover for owner-driver.",
        benefits: ["Own damage + third-party liability", "Personal accident cover for owner-driver", "Towing charges up to ₹2,500", "Hassle-free online claim process"],
        coverageDetails: [
            { label: "Own Damage", value: "Up to IDV" },
            { label: "Third-Party Liability", value: "Unlimited as per Act" },
            { label: "Towing", value: "Up to ₹2,500 per incident" },
            { label: "Personal Accident", value: "₹15 Lakh" },
        ],
        premiumInfo: { basePremium: "₹4,800/year", gst: "18% applicable", discounts: "NCB up to 50%, anti-theft device discount 2.5%", paymentOptions: "Annual payment, EMI on select cards" },
        eligibility: ["All private four-wheelers registered in India", "Valid RC and driving license required", "No age restriction for vehicle (pre-inspection may apply for older vehicles)"],
        termsAndConditions: ["Standard depreciation applies unless zero-dep add-on chosen", "Claims history affects premium at renewal", "Regular servicing records may be required for older vehicles", "Policy lapses if not renewed within 90 days of expiry"],
        claimProcess: ["Call HDFC ERGO helpline 1800-266-0700 to register claim", "Submit claim form, FIR, and vehicle photographs online", "Surveyor inspects the vehicle within 48 hours", "Settlement via cashless network or reimbursement within 10 days"],
        score: 84, reviewsCount: 22, ratingAverage: 4.3,
    },
    {
        policyId: "fe-car-4",
        name: "CarSafe 360°",
        company: "ICICI Lombard",
        price: 9500,
        coverage: 850000,
        category: "car",
        description: "All-round car protection with roadside assistance, NCB protection, and accessories cover.",
        benefits: ["360° coverage including accessories", "NCB protection even after a claim", "Emergency roadside assistance", "Daily allowance during repair period"],
        coverageDetails: [
            { label: "Own Damage", value: "Up to IDV + Accessories value" },
            { label: "Third-Party", value: "Unlimited liability cover" },
            { label: "Roadside Assist", value: "Battery jump, flat tyre, fuel delivery" },
            { label: "Daily Allowance", value: "₹1,000/day during repairs (max 15 days)" },
            { label: "Accessories", value: "Electrical & non-electrical up to ₹50K" },
        ],
        premiumInfo: { basePremium: "₹7,800/year", gst: "18% applicable", discounts: "NCB up to 50%, loyalty discount for renewals", paymentOptions: "Annual, quarterly, No-Cost EMI" },
        eligibility: ["Private cars and SUVs registered in India", "Both new and pre-owned vehicles accepted", "Pre-inspection required for break-in insurance", "Individual and company-owned vehicles eligible"],
        termsAndConditions: ["NCB protector allows one claim without losing NCB", "Accessories must be declared at policy inception", "War, nuclear risk, and intentional damage excluded", "Only authorized drivers covered under the policy"],
        claimProcess: ["Register claim on ICICI Lombard ILTakeCare app", "24x7 helpline: 1800-266-9725", "Upload documents: claim form, photos, FIR if applicable", "Cashless at 7000+ garages; reimbursement within 7 days"],
        score: 89, reviewsCount: 31, ratingAverage: 4.6,
    },

    // ─── BIKE ───
    {
        policyId: "fe-bike-1",
        name: "Two-Wheeler SafeRide",
        company: "Bajaj Allianz",
        price: 2800,
        coverage: 150000,
        category: "bike",
        description: "Comprehensive two-wheeler insurance with theft protection and personal accident cover for daily commuters.",
        benefits: ["Own damage + third-party cover", "Theft and fire protection", "Personal accident cover up to ₹15 lakh", "Zero depreciation add-on available"],
        coverageDetails: [
            { label: "Own Damage", value: "Up to IDV of the bike" },
            { label: "Third-Party", value: "Unlimited for bodily injury" },
            { label: "Theft", value: "Full IDV payout" },
            { label: "Personal Accident", value: "₹15 Lakh for owner-rider" },
        ],
        premiumInfo: { basePremium: "₹1,800/year", gst: "18% applicable", discounts: "NCB up to 50%, voluntary deductible savings", paymentOptions: "Annual, online payment discount 5%" },
        eligibility: ["All two-wheelers (scooters, motorcycles) registered in India", "Valid RC and driving license mandatory", "Bikes up to 15 years old eligible", "Owner must be 18+ years of age"],
        termsAndConditions: ["Valid for 1 year from date of issue", "Pillion rider not covered under personal accident", "Racing or stunt use voids the policy", "NCB transfers with the owner, not the vehicle"],
        claimProcess: ["Report accident/theft to police and insurer within 24 hours", "Call Bajaj Allianz at 1800-209-5858 or use the mobile app", "Submit photos, FIR copy, and repair estimate", "Cashless repair at network workshops or reimbursement in 7 days"],
        score: 86, reviewsCount: 35, ratingAverage: 4.4,
    },
    {
        policyId: "fe-bike-2",
        name: "BikeGuard Elite",
        company: "HDFC ERGO",
        price: 3200,
        coverage: 200000,
        category: "bike",
        description: "Premium bike insurance with engine protector and roadside assistance for daily riders and long-distance tourers.",
        benefits: ["Engine and gearbox protector", "24x7 roadside assistance", "Cashless claim at 6000+ workshops", "No-claim bonus up to 50%"],
        coverageDetails: [
            { label: "Own Damage", value: "Up to IDV" },
            { label: "Engine Protector", value: "Water ingression and oil leakage covered" },
            { label: "Roadside Assist", value: "Flat tyre, battery, towing included" },
            { label: "Third-Party", value: "Unlimited liability as per Act" },
        ],
        premiumInfo: { basePremium: "₹2,400/year", gst: "18% applicable", discounts: "NCB up to 50%, online purchase discount", paymentOptions: "Annual, UPI/Net Banking" },
        eligibility: ["All two-wheelers registered in India", "Engine capacity up to 350cc – standard rates", "Above 350cc – premium loading may apply", "Pre-inspection required for expired policies"],
        termsAndConditions: ["Engine protector valid only if manufacturer service schedule is followed", "Wear and tear, mechanical breakdown not covered", "Geographical limit: India only", "Policy renewal within 90 days of expiry to retain NCB"],
        claimProcess: ["Intimate via HDFC ERGO helpline 1800-266-0700 or website", "Surveyor visits within 24-48 hours", "Submit RC, DL, claim form, and photos", "Cashless at preferred workshops; reimbursement in 10 days"],
        score: 88, reviewsCount: 18, ratingAverage: 4.5,
    },
    {
        policyId: "fe-bike-3",
        name: "RideSure Basic",
        company: "Reliance General",
        price: 1599,
        coverage: 100000,
        category: "bike",
        description: "Affordable third-party bike insurance meeting all legal requirements. Perfect for budget-conscious riders.",
        benefits: ["Mandatory third-party liability cover", "Personal accident cover for rider", "Legal compliance guaranteed", "Quick online policy issuance in 2 minutes"],
        coverageDetails: [
            { label: "Third-Party", value: "Unlimited for death/injury to third party" },
            { label: "Property Damage", value: "Up to ₹1 Lakh" },
            { label: "Personal Accident", value: "₹15 Lakh for owner" },
        ],
        premiumInfo: { basePremium: "₹1,100/year", gst: "18% applicable", discounts: "Online discount of 5%", paymentOptions: "One-time annual payment" },
        eligibility: ["All two-wheelers registered in India", "Mandatory for all vehicles as per Motor Vehicle Act 1988", "No vehicle age restriction"],
        termsAndConditions: ["Only third-party damage covered — own damage not included", "Must be renewed before expiry for continuous coverage", "Does not cover damage to insured vehicle", "Drink and drive voids all claims"],
        claimProcess: ["Third party files claim with police report", "Insurer investigates and settles liability", "Contact Reliance General at 1800-102-4088", "Settlement as per MACT tribunal orders if disputed"],
        score: 82, reviewsCount: 42, ratingAverage: 4.1,
    },

    // ─── HEALTH ───
    {
        policyId: "fe-health-1",
        name: "Health Secure Elite",
        company: "HDFC ERGO",
        price: 18500,
        coverage: 1000000,
        category: "health",
        description: "Comprehensive family floater plan with cashless hospitalization, annual health checkups, and no room rent capping.",
        benefits: ["Cashless treatment at 12000+ network hospitals", "Pre and post hospitalization cover (60/180 days)", "No-claim bonus up to 100%", "Day-care procedures and domiciliary treatment"],
        coverageDetails: [
            { label: "In-Patient Hospitalization", value: "Up to sum insured, no sub-limits" },
            { label: "Pre-Hospitalization", value: "60 days before admission" },
            { label: "Post-Hospitalization", value: "180 days after discharge" },
            { label: "Day-Care Procedures", value: "580+ procedures covered" },
            { label: "Room Rent", value: "No capping — any room eligible" },
        ],
        premiumInfo: { basePremium: "₹15,700/year (individual)", gst: "18% applicable", discounts: "Family discount 10%, 2-year policy discount 7.5%", paymentOptions: "Annual, Monthly ECS, EMI via cards" },
        eligibility: ["Entry age: 18–65 years (adults), 91 days – 25 years (children)", "No pre-policy medical check-up needed up to age 45", "Family floater covers spouse, children, and parents", "Pre-existing diseases covered after 3-year waiting period"],
        termsAndConditions: ["30-day initial waiting period for non-accident claims", "Specific illnesses have a 2-year waiting period", "Pre-existing conditions: 3-year waiting period", "Cosmetic, dental, and experimental treatments excluded", "Policy must be renewed without break for continuous coverage"],
        claimProcess: ["Cashless: Present health card at network hospital reception", "Hospital sends pre-authorization to insurer", "Insurer approves within 2 hours for planned admissions", "Reimbursement: Submit original bills within 15 days of discharge", "Helpline: 1800-266-0700 (24x7)"],
        score: 91, reviewsCount: 23, ratingAverage: 4.6,
    },
    {
        policyId: "fe-health-2",
        name: "Care Supreme Family",
        company: "Care Health Insurance",
        price: 14900,
        coverage: 750000,
        category: "health",
        description: "Affordable family health plan with maternity and newborn coverage add-ons and unlimited e-consultations.",
        benefits: ["Automatic recharge of sum insured", "Maternity and newborn cover add-on", "Unlimited e-consultations", "Annual health checkup"],
        coverageDetails: [
            { label: "Hospitalization", value: "Up to ₹7.5 Lakh per year" },
            { label: "Sum Insured Recharge", value: "100% automatic top-up" },
            { label: "Maternity", value: "Up to ₹50,000 (add-on)" },
            { label: "E-Consultations", value: "Unlimited video/phone consultations" },
        ],
        premiumInfo: { basePremium: "₹12,600/year", gst: "18% applicable", discounts: "10% online discount, healthy lifestyle discount", paymentOptions: "Annual, Semi-annual" },
        eligibility: ["Entry age: 18–65 years", "Children from 91 days to 25 years under family floater", "Medical check-up required above age 50", "Maternity add-on available after 9-month waiting period"],
        termsAndConditions: ["30-day initial waiting period", "Pre-existing diseases covered after 36 months", "Maternity has a 9-month waiting period", "Non-allopathic treatments limited to ₹25,000 per year"],
        claimProcess: ["Cashless claims at 9000+ partner hospitals", "Pre-authorization via app or toll-free 1800-102-4488", "Reimbursement: Submit bills within 30 days of discharge", "Claims processed within 14 working days"],
        score: 88, reviewsCount: 17, ratingAverage: 4.4,
    },
    {
        policyId: "fe-health-3",
        name: "MediPrime Gold",
        company: "Star Health",
        price: 22000,
        coverage: 1500000,
        category: "health",
        description: "Premium health insurance with global coverage, alternative treatments, restoration benefit, and air ambulance.",
        benefits: ["Global emergency coverage", "AYUSH treatment included", "100% sum insured restoration", "Air ambulance cover up to ₹5 lakh"],
        coverageDetails: [
            { label: "Hospitalization", value: "Up to ₹15 Lakh, no sub-limits" },
            { label: "Restoration", value: "Sum insured restored 100% after first claim" },
            { label: "AYUSH", value: "Ayurveda, Yoga, Unani, Siddha, Homeopathy covered" },
            { label: "Air Ambulance", value: "Up to ₹5 Lakh" },
            { label: "Global Coverage", value: "Emergency treatment worldwide" },
        ],
        premiumInfo: { basePremium: "₹18,600/year", gst: "18% applicable", discounts: "Family discount 15%, 3-year policy discount 10%", paymentOptions: "Annual, EMI, UPI" },
        eligibility: ["Entry age: 18–65 years (lifelong renewability)", "No pre-policy check-up below 45 years", "Covers self, spouse, up to 4 children", "NRI coverage available for Indian citizens abroad"],
        termsAndConditions: ["30-day cooling off period; initial waiting 30 days", "Specific diseases: 24-month waiting period", "Pre-existing diseases: 48-month waiting", "Renewability guaranteed for life after first year", "War, self-inflicted injury, and substance abuse excluded"],
        claimProcess: ["24x7 helpline: 1800-425-2255", "Cashless at 14000+ network hospitals via Star Health app", "Pre-authorization: 4 hours for emergency, 12 hours planned", "Reimbursement: Original bills within 15 days; settled in 10 days"],
        score: 92, reviewsCount: 28, ratingAverage: 4.7,
    },

    // ─── LIFE ───
    {
        policyId: "fe-life-1",
        name: "Term Life Protect Plus",
        company: "ICICI Prudential",
        price: 12400,
        coverage: 20000000,
        category: "life",
        description: "Pure term life policy designed for long-term financial protection with flexible payout options and riders.",
        benefits: ["High sum assured up to ₹2 Cr", "Critical illness rider option", "Accidental death benefit", "Flexible premium payment terms"],
        coverageDetails: [
            { label: "Death Benefit", value: "₹2 Crore lump sum payout" },
            { label: "Critical Illness Rider", value: "Covers 34 critical illnesses" },
            { label: "Accidental Death", value: "Additional ₹1 Cr payout" },
            { label: "Terminal Illness", value: "Early payout on diagnosis" },
        ],
        premiumInfo: { basePremium: "₹12,400/year (30yr male, non-smoker)", gst: "18% applicable", discounts: "Non-smoker discount 15%, high SA discount, online discount", paymentOptions: "Annual, Semi-annual, Quarterly, Monthly" },
        eligibility: ["Entry age: 18–60 years", "Policy term: 10–40 years (max maturity age 75)", "Medical tests required for sum assured above ₹1 Cr", "Smokers and tobacco users accepted at higher premium", "Minimum annual income: ₹3 Lakh"],
        termsAndConditions: ["Suicide exclusion for the first 12 months", "Misrepresentation of health status can void the policy", "Premium must be paid within the grace period (30 days)", "Rider benefits cease with the base policy", "Tax benefits available under Section 80C and 10(10D)"],
        claimProcess: ["Nominee contacts ICICI Prudential at 1860-266-7766", "Submit death certificate, policy document, and claimant KYC", "For critical illness: submit specialist diagnosis report and test results", "Claim investigated and settled within 30 days of document submission", "Payout via NEFT/cheque to registered nominee"],
        score: 90, reviewsCount: 29, ratingAverage: 4.7,
    },
    {
        policyId: "fe-life-2",
        name: "Life Shield Smart",
        company: "Max Life",
        price: 9800,
        coverage: 15000000,
        category: "life",
        description: "Budget-friendly term cover with optional income payout on death — ideal for young earners starting their financial planning.",
        benefits: ["Affordable premiums for young earners", "Income replacement payout option", "Terminal illness cover", "Tax benefit under 80C / 10(10D)"],
        coverageDetails: [
            { label: "Death Benefit", value: "₹1.5 Crore lump sum or monthly income" },
            { label: "Income Option", value: "Monthly income to family for 10 years" },
            { label: "Terminal Illness", value: "Accelerated death benefit" },
            { label: "Waiver of Premium", value: "On disability/critical illness diagnosis" },
        ],
        premiumInfo: { basePremium: "₹9,800/year (28yr male, non-smoker)", gst: "18% applicable", discounts: "Non-smoker, high sum assured, online channel discount", paymentOptions: "Annual, Semi-annual, Monthly via NACH" },
        eligibility: ["Entry age: 18–55 years", "Maturity age: max 70 years", "Minimum sum assured: ₹50 Lakh", "Medical tests based on age and sum assured"],
        termsAndConditions: ["12-month suicide exclusion clause", "Lapsed policy can be revived within 5 years", "Grace period of 30 days for annual/semi-annual premium", "Free-look period of 30 days from policy receipt"],
        claimProcess: ["Notify Max Life at 1860-120-5577 or via website", "Submit claim form, death certificate, nominee ID proof", "For income payout option: monthly payments begin within 30 days", "Standard claims settled within 30 days"],
        score: 86, reviewsCount: 14, ratingAverage: 4.3,
    },
    {
        policyId: "fe-life-3",
        name: "SecureLife Endowment",
        company: "LIC",
        price: 15600,
        coverage: 10000000,
        category: "life",
        description: "Traditional endowment plan combining life cover with guaranteed maturity benefit and loyalty bonuses.",
        benefits: ["Guaranteed maturity benefit", "Loyalty additions on long tenures", "Loan facility against policy", "Death benefit + accrued bonuses to nominee"],
        coverageDetails: [
            { label: "Death Benefit", value: "Sum assured + accrued bonuses" },
            { label: "Maturity Benefit", value: "Sum assured + loyalty additions + bonuses" },
            { label: "Loan Facility", value: "Up to 90% of surrender value" },
            { label: "Bonus", value: "Declared annually, compounded" },
        ],
        premiumInfo: { basePremium: "₹15,600/year (35yr, 20yr term)", gst: "4.5% on first year, 2.25% renewal", discounts: "High SA rebate, annual payment mode rebate", paymentOptions: "Annual, Semi-annual, Quarterly, Monthly (SSS)" },
        eligibility: ["Entry age: 8–55 years (min maturity age 18)", "Policy term: 12–35 years", "Minimum sum assured: ₹1 Lakh", "Medical examination based on sum assured and age"],
        termsAndConditions: ["Surrender value available after 3 years of premium payment", "Paid-up value proportional to premiums paid vs total payable", "Loan interest rate set by LIC periodically", "Assignment and nomination facilities available", "Tax benefits under Section 80C; maturity exempt u/s 10(10D)"],
        claimProcess: ["Contact LIC branch or call 1800-258-9966", "Submit claim form (Annexure A), death certificate, and policy bond", "For maturity: auto-credit to registered bank account", "Death claims: NEFT within 30 days of document submission", "Nomination/assignment documents required if applicable"],
        score: 85, reviewsCount: 45, ratingAverage: 4.4,
    },

    // ─── TRAVEL ───
    {
        policyId: "fe-travel-1",
        name: "Travel Global Shield",
        company: "Reliance General",
        price: 3200,
        coverage: 500000,
        category: "travel",
        description: "International travel insurance for medical emergencies, trip disruptions, baggage protection, and personal liability.",
        benefits: ["Emergency hospitalization abroad", "Trip delay/cancellation reimbursement", "Baggage delay and passport loss assistance", "Personal liability cover"],
        coverageDetails: [
            { label: "Medical Emergency", value: "Up to $50,000 overseas" },
            { label: "Trip Cancellation", value: "Up to ₹2 Lakh" },
            { label: "Baggage Loss/Delay", value: "Up to ₹50,000" },
            { label: "Personal Liability", value: "Up to $100,000" },
            { label: "Passport Loss", value: "₹15,000 for emergency passport" },
        ],
        premiumInfo: { basePremium: "₹2,500 (7-day Asia trip)", gst: "18% applicable", discounts: "Family group discount, frequent traveler discount", paymentOptions: "One-time payment per trip" },
        eligibility: ["Indian passport holders travelling abroad", "Age: 6 months – 70 years", "Trip duration: 1–180 days per trip", "Valid visa and travel documents required"],
        termsAndConditions: ["Pre-existing medical conditions have limited coverage", "War zones and sanctioned countries excluded", "Claims for trip cancellation require documented reason", "Adventure activities may require additional add-on"],
        claimProcess: ["Contact 24x7 helpline: +91-22-4890-4890", "Medical claims: Get treatment and collect invoices", "Trip cancellation: Submit carrier/hotel cancellation proof", "File claim within 30 days of return", "Claims settled in 14–21 working days"],
        score: 84, reviewsCount: 9, ratingAverage: 4.1,
    },
    {
        policyId: "fe-travel-2",
        name: "Wanderlust Secure",
        company: "TATA AIG",
        price: 4500,
        coverage: 750000,
        category: "travel",
        description: "Premium travel cover with adventure sports, flight delay compensation, and emergency medical evacuation.",
        benefits: ["Adventure sports coverage included", "Flight delay compensation (4+ hours)", "Emergency medical evacuation", "Missed connection cover"],
        coverageDetails: [
            { label: "Medical Emergency", value: "Up to $100,000" },
            { label: "Medical Evacuation", value: "Up to $500,000" },
            { label: "Flight Delay", value: "₹5,000 per 6 hours (max ₹20,000)" },
            { label: "Adventure Sports", value: "Trekking, skiing, scuba included" },
            { label: "Missed Connection", value: "Up to ₹25,000" },
        ],
        premiumInfo: { basePremium: "₹3,800 (10-day Europe trip)", gst: "18% applicable", discounts: "Multi-trip annual policy saves 40%", paymentOptions: "Single premium per trip or annual multi-trip" },
        eligibility: ["Age: 2–70 years (above 60 at higher premium)", "Valid Indian passport", "Multi-trip option for frequent flyers", "Student plans available for study abroad"],
        termsAndConditions: ["Adventure sports must be recreational, not competitive", "Flight delay claims require airline confirmation letter", "Maximum trip duration 90 days for single trip", "Alcohol-related incidents not covered"],
        claimProcess: ["Emergency helpline: 1800-266-7780", "Overseas assistance partner handles hospitalizations directly", "Submit claim with supporting documents via portal", "Flight delay: Upload boarding pass and airline notification", "Claims processed within 10 working days"],
        score: 87, reviewsCount: 15, ratingAverage: 4.4,
    },
    {
        policyId: "fe-travel-3",
        name: "DomesticTrip Guard",
        company: "ICICI Lombard",
        price: 1200,
        coverage: 200000,
        category: "travel",
        description: "Affordable domestic travel insurance covering accidents, hotel cancellation, and medical emergencies within India.",
        benefits: ["Domestic trip medical cover", "Hotel booking cancellation refund", "Checked-in baggage loss cover", "Personal accident during travel"],
        coverageDetails: [
            { label: "Medical Emergency", value: "Up to ₹2 Lakh" },
            { label: "Trip Cancellation", value: "Up to ₹50,000" },
            { label: "Baggage Loss", value: "Up to ₹20,000" },
            { label: "Personal Accident", value: "₹5 Lakh accidental death" },
        ],
        premiumInfo: { basePremium: "₹899 (5-day domestic trip)", gst: "18% applicable", discounts: "Online booking discount 5%", paymentOptions: "One-time per trip" },
        eligibility: ["Indian residents travelling within India", "Age: 18–70 years", "Covers air, rail, and road travel"],
        termsAndConditions: ["Claims for pre-existing conditions excluded", "Original receipts required for baggage claims", "Trip cancellation must be due to covered reasons (illness, natural disaster)", "Maximum policy period: 30 days per trip"],
        claimProcess: ["Register claim on ILTakeCare app or call 1800-266-9725", "Submit travel tickets, hotel invoices, and medical bills", "Baggage claims: File FIR and submit carrier complaint", "Settlement within 14 working days"],
        score: 82, reviewsCount: 21, ratingAverage: 4.0,
    },

    // ─── HOME ───
    {
        policyId: "fe-home-1",
        name: "Home Protect Gold",
        company: "New India Assurance",
        price: 5400,
        coverage: 2500000,
        category: "home",
        description: "Home structure and content protection against fire, flood, earthquake, burglary, and natural disasters.",
        benefits: ["Building + contents cover", "Fire and allied perils protection", "Burglary and theft support", "Temporary accommodation expenses"],
        coverageDetails: [
            { label: "Building Structure", value: "Up to ₹25 Lakh" },
            { label: "Contents", value: "Up to ₹5 Lakh (add-on)" },
            { label: "Fire & Allied Perils", value: "Full cover" },
            { label: "Burglary", value: "Up to sum insured" },
            { label: "Temp Accommodation", value: "Up to ₹1 Lakh for 3 months" },
        ],
        premiumInfo: { basePremium: "₹4,200/year", gst: "18% applicable", discounts: "Multi-year policy discount 10%, safety device discount", paymentOptions: "Annual, 3-year, 5-year policy terms" },
        eligibility: ["Residential properties in India", "Owner-occupied or rented homes", "Building must comply with local municipal regulations", "Properties under construction not eligible"],
        termsAndConditions: ["Earthquake coverage is optional add-on", "War, nuclear hazard, and terrorism excluded (unless add-on purchased)", "Gradual deterioration and wear & tear not covered", "Vacant property for 30+ days must be disclosed", "Sum insured must reflect current market/reinstatement value"],
        claimProcess: ["Report incident to local authorities (police/fire brigade)", "Contact New India Assurance at 1800-209-1415", "Submit claim form with photos, FIR, and repair estimates", "Surveyor inspection within 48 hours", "Claim settled within 30 days of survey completion"],
        score: 83, reviewsCount: 8, ratingAverage: 4.0,
    },
    {
        policyId: "fe-home-2",
        name: "SmartHome Shield",
        company: "HDFC ERGO",
        price: 7800,
        coverage: 4000000,
        category: "home",
        description: "Comprehensive home insurance covering structure, contents, valuables, landlord liability, and natural disasters.",
        benefits: ["Structure + content + valuable items", "Earthquake and flood cover", "Landlord liability protection", "Alternative accommodation up to 12 months"],
        coverageDetails: [
            { label: "Building", value: "Up to ₹40 Lakh" },
            { label: "Contents", value: "Up to ₹10 Lakh" },
            { label: "Valuables", value: "Jewellery, art up to ₹3 Lakh" },
            { label: "Landlord Liability", value: "Up to ₹10 Lakh" },
            { label: "Natural Disasters", value: "Earthquake, flood, landslide" },
        ],
        premiumInfo: { basePremium: "₹6,200/year", gst: "18% applicable", discounts: "Security system discount, loyalty discount", paymentOptions: "Annual, 3-year bundle" },
        eligibility: ["Owner-occupied or rented residential property", "Commercial properties not eligible under this plan", "Property must be in habitable condition", "Building age up to 40 years"],
        termsAndConditions: ["Valuables must be declared with receipts/appraisals", "Flood cover has 24-hour waiting period", "Tenant damage covered under landlord liability", "Home office equipment requires separate add-on"],
        claimProcess: ["Call HDFC ERGO at 1800-266-0700 within 24 hours", "Submit photos, incident report, and repair quotes", "Surveyor assigned within 24-48 hours", "Settlement via repair or replacement at insurer's choice", "Claims resolved within 15–30 working days"],
        score: 86, reviewsCount: 12, ratingAverage: 4.3,
    },
    {
        policyId: "fe-home-3",
        name: "Tenant SafeNest",
        company: "Bajaj Allianz",
        price: 2900,
        coverage: 1000000,
        category: "home",
        description: "Designed for renters — covers personal belongings, electronics, tenant liability, and temporary relocation costs.",
        benefits: ["Personal belongings and electronics cover", "Tenant liability protection", "Theft and burglary claim support", "Temporary relocation expenses"],
        coverageDetails: [
            { label: "Personal Belongings", value: "Up to ₹5 Lakh" },
            { label: "Electronics", value: "Up to ₹2 Lakh" },
            { label: "Tenant Liability", value: "Up to ₹3 Lakh" },
            { label: "Relocation Costs", value: "Up to ₹50,000" },
        ],
        premiumInfo: { basePremium: "₹2,200/year", gst: "18% applicable", discounts: "Online purchase discount 5%", paymentOptions: "Annual one-time payment" },
        eligibility: ["Tenants with a valid rental/lease agreement", "Rented residential property in India", "Items must be within rented premises"],
        termsAndConditions: ["Landlord's building structure not covered", "Items outside the rented premises excluded", "Wear and tear or gradual deterioration not covered", "Cash and important documents excluded from contents cover"],
        claimProcess: ["Report theft/damage to police within 24 hours", "Notify Bajaj Allianz at 1800-209-5858", "Submit FIR, photos, and inventory list of damaged/lost items", "Surveyor visit for claims above ₹50,000", "Settlement within 14 working days"],
        score: 81, reviewsCount: 6, ratingAverage: 3.9,
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        await Policy.deleteMany({});
        console.log("🗑️  Cleared existing policies");

        /* Add segment & subtype to existing policies */
        const enrichedOld = policies.map(p => ({
            ...p,
            segment: p.segment || SEGMENT_MAP[p.category] || "general",
            subtype: p.subtype || SUBTYPE_MAP[p.category] || "",
        }));

        const allPoliciesRaw = [...enrichedOld, ...newPolicies, ...insurancePlans];
        const allPolicies = allPoliciesRaw.map(p => ({
            ...p,
            financialTerms: p.financialTerms || { 
                deductible: Math.floor(Math.random() * 2000) + 500, 
                copayPercentage: p.category === 'health' ? 10 : 0 
            },
            availableRiders: p.availableRiders || [
                { name: "Premium Protection", price: Math.floor(Math.random() * 2000) + 500 },
                { name: "24/7 Priority Support", price: Math.floor(Math.random() * 1000) + 300 }
            ],
            policyTermYears: p.policyTermYears || (p.category === 'life' ? 20 : 1),
            gracePeriodDays: p.gracePeriodDays || 30,
            taxBenefitSection: p.taxBenefitSection || (p.category === "health" ? "80D" : p.category === "life" ? "80C" : "None"),
        }));
        await Policy.insertMany(allPolicies);
        console.log(`✅ Seeded ${allPolicies.length} policies (${enrichedOld.length} existing + ${newPolicies.length} new + ${insurancePlans.length} generated)`);

        await mongoose.disconnect();
        console.log("✅ Done — disconnected");
    } catch (err) {
        console.error("❌ Seed error:", err.message);
        process.exit(1);
    }
}

seed();

