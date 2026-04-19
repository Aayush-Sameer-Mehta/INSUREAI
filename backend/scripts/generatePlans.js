import fs from 'fs';

const lifeInsurers = [
    "LIC", "HDFC Life", "ICICI Prudential", "SBI Life", "Max Life", "Kotak Life", 
    "Tata AIA", "Aditya Birla Sun Life", "Bajaj Allianz Life", "PNB MetLife",
    "Reliance Nippon Life", "Aviva Life", "Edelweiss Tokio Life", "Canara HSBC Life",
    "IndiaFirst Life", "Bandhan Life", "Acko Life", "Go Digit Life"
];

const healthInsurers = ["Star Health", "Niva Bupa", "Care Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz", "Tata AIG"];
const motorInsurers = ["ICICI Lombard", "HDFC ERGO", "Bajaj Allianz", "Tata AIG", "New India Assurance", "Oriental Insurance"];
const genInsurers = ["New India Assurance", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz", "Tata AIG"];

const plans = [];
let idCounter = 1;

function createPlan(base) {
    base.policyId = `plan-gen-${idCounter++}`;
    base.score = Math.floor(Math.random() * 21) + 75; // 75 to 95
    base.reviewsCount = Math.floor(Math.random() * 200) + 5;
    base.ratingAverage = Number((Math.random() * 1.5 + 3.5).toFixed(1)); // 3.5 to 5.0
    plans.push(base);
}

// LIFE INSURANCE
lifeInsurers.forEach(company => {
    // Term Basic
    createPlan({
        name: `${company} Smart Term Plan`, company, price: Math.floor(Math.random()*5000)+6000, coverage: 10000000,
        category: "life", segment: "life", subtype: "term_basic",
        description: `Pure term life insurance from ${company} offering high life cover at affordable premiums with simplified underwriting.`,
        benefits: ["High sum assured up to ₹1 Cr", "Simple online purchase", "Tax benefits under Section 80C"],
        coverageDetails: [{label: "Death Benefit", value: "₹1 Crore lump sum"}, {label: "Terminal Illness", value: "Accelerated benefit"}],
        premiumInfo: {basePremium: "₹8,000/year approx", gst: "18% applicable", discounts: "Non-smoker, online", paymentOptions: "Annual, Monthly"},
        eligibility: ["Entry age: 18-65 years", "Policy term: 10-40 years"],
        termsAndConditions: ["Suicide exclusion: 12 months", "Free-look: 30 days"],
        claimProcess: ["Contact customer care", "Submit death certificate and forms", "Settled in 30 days"]
    });
    // Return of Premium
    createPlan({
        name: `${company} Term with ROP`, company, price: Math.floor(Math.random()*10000)+15000, coverage: 5000000,
        category: "life", segment: "life", subtype: "return_of_premium",
        description: `Get all your premiums back upon survival to maturity along with robust life cover during the term from ${company}.`,
        benefits: ["100% Return of Premium on maturity", "Comprehensive life cover", "Tax benefits"],
        coverageDetails: [{label: "Death Benefit", value: "₹50 Lakh"}, {label: "Maturity Benefit", value: "100% premiums returned"}],
        premiumInfo: {basePremium: "₹18,000/year approx", gst: "18%", discounts: "Annual mode", paymentOptions: "Annual, Monthly"},
        eligibility: ["Entry age: 18-50 years", "Term: 15-30 years"],
        termsAndConditions: ["Survival till end of term required for ROP", "Subject to all premiums paid"],
        claimProcess: ["Maturity claim process", "Submit original policy document"]
    });
    // Endowment
    createPlan({
        name: `${company} Guaranteed Savings Plan`, company, price: Math.floor(Math.random()*20000)+30000, coverage: 1500000,
        category: "life", segment: "life", subtype: "endowment",
        description: `Traditional endowment plan combining life cover with guaranteed maturity benefit and loyalty additions by ${company}.`,
        benefits: ["Guaranteed returns", "Life cover included", "Loan facility available"],
        coverageDetails: [{label: "Death Benefit", value: "Sum assured + bonuses"}, {label: "Maturity Benefit", value: "Guaranteed sum + bonuses"}],
        premiumInfo: {basePremium: "₹35,000/year approx", gst: "4.5% first year", discounts: "High SA", paymentOptions: "Annual"},
        eligibility: ["Entry age: 0-55 years", "Term: 10-25 years"],
        termsAndConditions: ["Lock-in period applies", "Surrender penalities early on"],
        claimProcess: ["Submit claim form", "Provide NEFT details"]
    });
    // ULIP
    createPlan({
        name: `${company} Wealth Plus ULIP`, company, price: Math.floor(Math.random()*50000)+50000, coverage: 500000,
        category: "life", segment: "life", subtype: "ulip",
        description: `Market-linked investment plan with life cover, offering multiple fund options and tax-free maturity by ${company}.`,
        benefits: ["Choice of equity/debt funds", "Life cover 10x premium", "Tax-free maturity u/s 10(10D)"],
        coverageDetails: [{label: "Death Benefit", value: "Higher of Fund Value or SA"}, {label: "Maturity Benefit", value: "Fund Value"}],
        premiumInfo: {basePremium: "₹1,00,000/year", gst: "18% on charges", discounts: "Online purchase", paymentOptions: "Annual, SIP"},
        eligibility: ["Entry age: 1 month to 60 years", "Lock-in: 5 years"],
        termsAndConditions: ["Market risk borne by policyholder", "5-year lock-in mandatory"],
        claimProcess: ["Submit surrender/maturity form", "KYC docs required"]
    });
});

// HEALTH INSURANCE
healthInsurers.forEach(company => {
    // Individual
    createPlan({
        name: `${company} Health Care Individual`, company, price: 8000 + Math.floor(Math.random()*4000), coverage: 500000,
        category: "health", segment: "health", subtype: "individual_health",
        description: `Comprehensive health coverage for individuals including hospitalisation, day care, and wellness benefits.`,
        benefits: ["Cashless network hospitals", "No room rent capping", "Annual health checkup"],
        coverageDetails: [{label: "In-patient", value: "Up to SA"}, {label: "Pre/Post Hospitalization", value: "60/180 days"}],
        premiumInfo: {basePremium: "₹9,500/year approx", gst: "18%", discounts: "Healthy lifestyle", paymentOptions: "Annual"},
        eligibility: ["Entry age: 18-65 years"], termsAndConditions: ["Waiting periods apply"], claimProcess: ["Cashless via TPA"]
    });
    // Family Floater
    createPlan({
        name: `${company} Family Shield`, company, price: 15000 + Math.floor(Math.random()*8000), coverage: 1000000,
        category: "health", segment: "health", subtype: "family_floater",
        description: `One policy for the whole family covering parents and children with high sum insured and maternity cover.`,
        benefits: ["Cover for up to 6 members", "Maternity benefit", "Automatic restoration"],
        coverageDetails: [{label: "Hospitalization", value: "Shared SA ₹10 Lakh"}, {label: "Maternity", value: "Up to ₹50k"}],
        premiumInfo: {basePremium: "₹18,000/year approx", gst: "18%", discounts: "Online discount", paymentOptions: "Annual"},
        eligibility: ["Family of 2A+4C max"], termsAndConditions: ["Maternity waiting period 2 yrs"], claimProcess: ["Cashless via App"]
    });
});

// MOTOR (Car & Bike)
motorInsurers.forEach(company => {
    // Car Comprehensive
    createPlan({
        name: `${company} Car Protect`, company, price: 12000 + Math.floor(Math.random()*8000), coverage: 800000,
        category: "car", segment: "general", subtype: "comprehensive_car",
        description: `Complete protection for your car against accidents, theft, fire, and third-party liabilities.`,
        benefits: ["Own damage cover", "Third party liability", "Cashless garages"],
        coverageDetails: [{label: "OD", value: "Up to IDV"}, {label: "TP", value: "Unlimited liability"}],
        premiumInfo: {basePremium: "₹15,000/year approx", gst: "18%", discounts: "NCB up to 50%", paymentOptions: "Annual"},
        eligibility: ["Valid RC and DL"], termsAndConditions: ["Deductible applies"], claimProcess: ["Surveyor inspection"]
    });
    // Bike Comprehensive
    createPlan({
        name: `${company} Two-Wheeler Guard`, company, price: 1500 + Math.floor(Math.random()*1500), coverage: 80000,
        category: "bike", segment: "general", subtype: "comprehensive_bike",
        description: `Affordable comprehensive cover for your two-wheeler against damage, theft, and third-party claims.`,
        benefits: ["Own damage", "Third party liability"],
        coverageDetails: [{label: "OD", value: "Up to IDV"}, {label: "TP", value: "Unlimited liability"}],
        premiumInfo: {basePremium: "₹2,000/year approx", gst: "18%", discounts: "NCB", paymentOptions: "Annual"},
        eligibility: ["Valid RC"], termsAndConditions: ["Wear & tear excluded"], claimProcess: ["Cashless at network"]
    });
});

// HOME / PROPERTY
genInsurers.forEach(company => {
    createPlan({
        name: `${company} Home Secure`, company, price: 4000 + Math.floor(Math.random()*3000), coverage: 5000000,
        category: "home", segment: "general", subtype: "home_structure",
        description: `Protect your house structure and contents against fire, burglary, natural calamities.`,
        benefits: ["Structure cover", "Contents cover", "Burglary cover"],
        coverageDetails: [{label: "Structure", value: "₹50 Lakh"}, {label: "Contents", value: "₹10 Lakh"}],
        premiumInfo: {basePremium: "₹5,000/year approx", gst: "18%", discounts: "Long term discount", paymentOptions: "Annual, 3-yr, 5-yr"},
        eligibility: ["Owned or rented residence"], termsAndConditions: ["Valuables need declaration"], claimProcess: ["Surveyor visit"]
    });
});

// TRAVEL
genInsurers.forEach(company => {
    createPlan({
        name: `${company} Global Travel Shield`, company, price: 1500 + Math.floor(Math.random()*2000), coverage: 3500000,
        category: "travel", segment: "general", subtype: "international_travel",
        description: `International travel insurance covering medical emergencies, trip delay, baggage loss.`,
        benefits: ["Medical emergency abroad", "Trip cancellation", "Lost baggage"],
        coverageDetails: [{label: "Medical", value: "$50,000"}, {label: "Baggage", value: "$500"}],
        premiumInfo: {basePremium: "₹2,000 approx", gst: "18%", discounts: "Family package", paymentOptions: "Per Trip"},
        eligibility: ["Valid passport & visa"], termsAndConditions: ["Pre-existing diseases excluded"], claimProcess: ["Toll-free international help desk"]
    });
});

// PERSONAL ACCIDENT (New Category)
const paInsurers = ["ICICI Lombard", "HDFC ERGO", "New India Assurance", "Tata AIG", "SBI General"];
paInsurers.forEach(company => {
    createPlan({
        name: `${company} Personal Accident Guard`, company, price: 1000 + Math.floor(Math.random()*1500), coverage: 2500000,
        category: "personal_accident", segment: "health", subtype: "personal_accident", // Needs to be added to model enum
        description: `Comprehensive personal accident cover providing financial security against accidental death, and permanent/temporary disability.`,
        benefits: ["Accidental Death Cover", "Permanent Total Disability", "Temporary Total Disability income", "Education grant for children"],
        coverageDetails: [{label: "Accidental Death", value: "100% of SA"}, {label: "Total Permanent Disability", value: "150% of SA"}, {label: "Weekly Income", value: "0.1% of SA per week for TTD"}],
        premiumInfo: {basePremium: "₹1,500/year approx", gst: "18%", discounts: "No claim discount", paymentOptions: "Annual"},
        eligibility: ["Entry age: 18-70 years", "Occupational classes 1, 2, and 3"],
        termsAndConditions: ["Adventure sports participation excluded", "Self-inflicted injuries excluded"],
        claimProcess: ["File FIR", "Submit claim form with medical certificates"]
    });
});

// BUSINESS / LIABILITY
genInsurers.forEach(company => {
    createPlan({
        name: `${company} SME Business Protect`, company, price: 25000 + Math.floor(Math.random()*20000), coverage: 10000000,
        category: "business", segment: "general", subtype: "sme_package",
        description: `Complete package policy for Small and Medium Enterprises covering fire, burglary, liability and business interruption.`,
        benefits: ["Fire & Special Perils", "Burglary Cover", "Public Liability", "Business Interruption"],
        coverageDetails: [{label: "Property Cover", value: "₹1 Crore"}, {label: "Liability", value: "₹25 Lakh"}],
        premiumInfo: {basePremium: "₹35,000/year approx", gst: "18%", discounts: "Good risk discount", paymentOptions: "Annual"},
        eligibility: ["Registered SMEs"], termsAndConditions: ["Subject to risk inspection"], claimProcess: ["Immediate intimation required"]
    });
});

// GROUP INSURANCE (New Category)
const groupInsurers = ["ICICI Lombard", "Star Health", "HDFC ERGO", "Max Life", "LIC"];
groupInsurers.forEach(company => {
    createPlan({
        name: `${company} Corporate Group Cover`, company, price: 5000, coverage: 300000, 
        category: "group", segment: "health", subtype: "group_health", // Needs to be added to model enum
        description: `Group health and life insurance solution for corporate employees offering day-1 coverage for pre-existing diseases.`,
        benefits: ["Day-1 pre-existing coverage", "Maternity benefit included", "Corporate buffer facility", "Cashless claims at network hospitals"],
        coverageDetails: [{label: "Employee Health", value: "₹3 Lakh Base Cover"}, {label: "Corporate Buffer", value: "₹20 Lakh shared pool"}],
        premiumInfo: {basePremium: "Customized per group size", gst: "18%", discounts: "Large group discount", paymentOptions: "Annual Corporate Pay"},
        eligibility: ["Minimum group size: 10 employees", "Employer-employee relationship mandatory"],
        termsAndConditions: ["Details of employees leaving/joining must be reported monthly", "Dependants cover optional based on corporate plan"],
        claimProcess: ["Corporate TPA desk", "E-cards for all employees", "Cashless authorization"]
    });
});

// MICRO / SPECIALTY
const microInsurers = ["Agriculture Insurance Co.", "LIC", "Bajaj Allianz"];
microInsurers.forEach(company => {
    createPlan({
        name: `${company} Micro Secure`, company, price: 500, coverage: 50000,
        category: "micro_social", segment: "general", subtype: "rural_health",
        description: `Targeted at rural and low-income demographics offering highly affordable life and health coverage.`,
        benefits: ["Affordable premium", "Simple enrolment", "Basic hospital cash benefit"],
        coverageDetails: [{label: "Hospital Cash", value: "₹500/day"}, {label: "Death Cover", value: "₹50,000"}],
        premiumInfo: {basePremium: "₹500/year", gst: "Exempt", discounts: "None", paymentOptions: "Annual"},
        eligibility: ["Age 18-50", "Rural/semi-urban residence"],
        termsAndConditions: ["Simple terms"], claimProcess: ["Through local NGOs/banks"]
    });
});


fs.writeFileSync('./scripts/insurancePlans.json', JSON.stringify(plans, null, 2));
console.log(`Successfully generated ${plans.length} plans.`);
