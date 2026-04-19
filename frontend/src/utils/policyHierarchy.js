export const POLICY_HIERARCHY = [
 {
 id: "life-insurance",
 label: "Life Insurance",
 backendCategory: "life",
 children: [
 {
 id: "protection",
 label: "Protection",
 children: [
 {
 id: "term-insurance",
 label: "Term Insurance",
 children: [
 { id: "basic-term", label: "Basic Term", keywords: ["term", "basic"] },
 { id: "return-of-premium", label: "Return of Premium", keywords: ["return", "premium", "rop"] },
 ],
 },
 ],
 },
 {
 id: "savings",
 label: "Savings",
 children: [
 { id: "endowment", label: "Endowment", keywords: ["endowment", "savings"] },
 { id: "money-back", label: "Money Back", keywords: ["money", "back"] },
 ],
 },
 {
 id: "investment",
 label: "Investment",
 children: [
 { id: "ulip", label: "ULIP", keywords: ["ulip", "unit linked", "investment"] },
 ],
 },
 {
 id: "retirement",
 label: "Retirement",
 children: [
 { id: "pension", label: "Pension", keywords: ["pension", "retirement"] },
 { id: "annuity", label: "Annuity", keywords: ["annuity"] },
 ],
 },
 {
 id: "child",
 label: "Child",
 children: [
 { id: "education-plans", label: "Education Plans", keywords: ["child", "education", "school"] },
 ],
 },
 ],
 },
 {
 id: "general-insurance",
 label: "General Insurance",
 children: [
 {
 id: "health",
 label: "Health",
 backendCategory: "health",
 children: [
 { id: "individual-health", label: "Individual", keywords: ["individual"] },
 { id: "family-floater", label: "Family Floater", keywords: ["family", "floater"] },
 { id: "senior-citizen", label: "Senior Citizen", keywords: ["senior"] },
 { id: "critical-illness", label: "Critical Illness", keywords: ["critical", "illness"] },
 { id: "top-up", label: "Top-Up", keywords: ["top-up", "super top-up"] },
 ],
 },
 {
 id: "motor",
 label: "Motor",
 children: [
 {
 id: "car",
 label: "Car",
 backendCategory: "car",
 children: [
 { id: "car-third-party", label: "Third Party", keywords: ["third party", "tp"] },
 { id: "car-comprehensive", label: "Comprehensive", keywords: ["comprehensive"] },
 { id: "car-own-damage", label: "Own Damage", keywords: ["own damage", "od"] },
 ],
 },
 {
 id: "bike",
 label: "Bike",
 backendCategory: "bike",
 children: [
 { id: "bike-third-party", label: "Third Party", keywords: ["third party", "tp"] },
 { id: "bike-comprehensive", label: "Comprehensive", keywords: ["comprehensive"] },
 ],
 },
 {
 id: "commercial-vehicle",
 label: "Commercial Vehicle",
 backendCategory: "motor_commercial",
 children: [
 { id: "commercial-goods", label: "Goods", keywords: ["goods", "cargo vehicle"] },
 { id: "commercial-passenger", label: "Passenger", keywords: ["passenger", "bus", "taxi"] },
 { id: "commercial-special", label: "Special", keywords: ["special", "tractor", "crane"] },
 ],
 },
 {
 id: "motor-addons",
 label: "Add-ons",
 isAddonGroup: true,
 children: [
 { id: "addon-zero-dep", label: "Zero Dep", keywords: ["zero", "depreciation", "nil"] },
 { id: "addon-engine", label: "Engine Protect", keywords: ["engine"] },
 { id: "addon-rsa", label: "RSA", keywords: ["roadside", "rsa"] },
 { id: "addon-rti", label: "Return to Invoice", keywords: ["rti", "invoice"] },
 { id: "addon-consumables", label: "Consumables", keywords: ["consumable"] },
 ],
 },
 ],
 },
 {
 id: "property",
 label: "Property",
 backendCategory: "home",
 children: [
 { id: "home-insurance", label: "Home", keywords: ["home", "house"] },
 { id: "fire-insurance", label: "Fire", keywords: ["fire"] },
 { id: "shop-insurance", label: "Shop", keywords: ["shop", "retail"] },
 { id: "office-insurance", label: "Office", keywords: ["office", "workplace"] },
 ],
 },
 {
 id: "travel",
 label: "Travel",
 backendCategory: "travel",
 children: [
 { id: "travel-domestic", label: "Domestic", keywords: ["domestic", "india"] },
 { id: "travel-international", label: "International", keywords: ["international", "global"] },
 { id: "travel-student", label: "Student", keywords: ["student", "study"] },
 { id: "travel-senior", label: "Senior", keywords: ["senior"] },
 { id: "travel-multi", label: "Multi-trip", keywords: ["multi", "annual"] },
 ],
 },
 {
 id: "personal-accident",
 label: "Personal Accident",
 backendCategory: "personal_accident",
 children: [
 { id: "pa-individual", label: "Individual", keywords: ["accident", "personal"] },
 { id: "pa-group", label: "Group", keywords: ["group accident"] },
 ],
 },
 {
 id: "business",
 label: "Business",
 children: [
 {
 id: "liability",
 label: "Liability",
 backendCategory: "liability",
 children: [
 { id: "liab-public", label: "Public", keywords: ["public liability"] },
 { id: "liab-professional", label: "Professional", keywords: ["professional indemnity"] },
 { id: "liab-dno", label: "D&O", keywords: ["directors", "officers", "d&o"] },
 { id: "liab-product", label: "Product", keywords: ["product liability"] },
 ],
 },
 {
 id: "marine",
 label: "Marine",
 backendCategory: "business",
 children: [
 { id: "marine-cargo", label: "Cargo", keywords: ["marine", "cargo", "transit"] },
 { id: "marine-hull", label: "Hull", keywords: ["hull", "vessel", "ship"] },
 ],
 },
 {
 id: "engineering",
 label: "Engineering",
 backendCategory: "business",
 children: [
 { id: "eng-contractor", label: "Contractor All Risk", keywords: ["contractor", "car policy"] },
 { id: "eng-machinery", label: "Machinery Breakdown", keywords: ["machinery", "breakdown"] },
 { id: "eng-equipment", label: "Equipment", keywords: ["equipment", "cpm"] },
 ],
 },
 {
 id: "cyber",
 label: "Cyber",
 backendCategory: "business",
 children: [
 { id: "cyber-breach", label: "Data Breach", keywords: ["cyber", "data", "breach"] },
 { id: "cyber-interruption", label: "Business Interruption", keywords: ["interruption", "downtime"] },
 ],
 },
 ],
 },
 {
 id: "specialty",
 label: "Specialty",
 backendCategory: "specialty",
 children: [
 { id: "spec-pet", label: "Pet", keywords: ["pet", "dog", "cat"] },
 { id: "spec-gadget", label: "Gadget", keywords: ["gadget", "mobile", "laptop"] },
 { id: "spec-event", label: "Event", keywords: ["event", "concert", "exhibition"] },
 { id: "spec-wedding", label: "Wedding", keywords: ["wedding", "marriage"] },
 ],
 },
 ],
 },
 {
 id: "group-insurance",
 label: "Group Insurance",
 backendCategory: "group",
 children: [
 { id: "group-health", label: "Group Health", keywords: ["group health", "gmc"] },
 { id: "group-life", label: "Group Life", keywords: ["group life", "gtl"] },
 { id: "group-pa", label: "Group Personal Accident", keywords: ["group personal", "gpa"] },
 { id: "group-benefits", label: "Employee Benefits", keywords: ["employee", "benefits"] },
 ],
 },
 {
 id: "micro-insurance",
 label: "Micro Insurance",
 backendCategory: "micro_social",
 children: [
 { id: "micro-crop", label: "Crop", keywords: ["crop", "kisan", "pmfby"] },
 { id: "micro-livestock", label: "Livestock", keywords: ["livestock", "cattle", "cow"] },
 { id: "micro-rural", label: "Rural Health", keywords: ["rural", "village"] },
 { id: "micro-business", label: "Micro Business", keywords: ["micro", "msme"] },
 ],
 },
];

const buildHierarchyIndex = (nodes, parentPath = [], index = new Map()) => {
 nodes.forEach((node) => {
 const path = [...parentPath, { id: node.id, label: node.label }];
 index.set(node.id, { node, path });

 if (node.children?.length) {
 buildHierarchyIndex(node.children, path, index);
 }
 });

 return index;
};

const HIERARCHY_INDEX = buildHierarchyIndex(POLICY_HIERARCHY);

export const findNodeById = (_nodes, id) => HIERARCHY_INDEX.get(id) || null;

export const getInheritedBackendCategory = (_hierarchy, targetId) => {
 const result = findNodeById(POLICY_HIERARCHY, targetId);
 if (!result) return "all";

 for (let i = result.path.length - 1; i >= 0; i -= 1) {
 const nodeData = HIERARCHY_INDEX.get(result.path[i].id)?.node;
 if (nodeData?.backendCategory) {
 return nodeData.backendCategory;
 }
 }

 return "all";
};
