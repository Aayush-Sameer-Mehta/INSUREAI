import {
 CarIcon,
 BikeIcon,
 HealthIcon,
 LifeIcon,
 TravelIcon,
 HomeIcon,
 MotorCommercialIcon,
 LiabilityIcon,
 BusinessIcon,
 AgricultureIcon,
 MicroSocialIcon,
 SpecialtyIcon,
 PAIcon,
 GroupIcon,
} from "../components/CustomIcons";

export const CATEGORY_ICONS = {
 car: CarIcon,
 bike: BikeIcon,
 health: HealthIcon,
 life: LifeIcon,
 travel: TravelIcon,
 home: HomeIcon,
 motor_commercial: MotorCommercialIcon,
 liability: LiabilityIcon,
 business: BusinessIcon,
 agriculture: AgricultureIcon,
 micro_social: MicroSocialIcon,
 specialty: SpecialtyIcon,
 personal_accident: PAIcon,
 group: GroupIcon,
};

export const CATEGORY_GRADIENTS = {
 car: "from-blue-500 to-blue-700",
 bike: "from-emerald-500 to-emerald-700",
 health: "from-rose-500 to-rose-700",
 life: "from-violet-500 to-violet-700",
 travel: "from-amber-500 to-amber-700",
 home: "from-cyan-500 to-cyan-700",
 motor_commercial: "from-orange-500 to-orange-700",
 liability: "from-pink-500 to-pink-700",
 business: "from-indigo-500 to-indigo-700",
 agriculture: "from-lime-500 to-lime-700",
 micro_social: "from-teal-500 to-teal-700",
 specialty: "from-purple-500 to-purple-700",
 personal_accident: "from-red-500 to-red-700",
 group: "from-sky-500 to-sky-700",
};

export const CATEGORY_LABELS = {
 car: "Car",
 bike: "Bike",
 health: "Health",
 life: "Life",
 travel: "Travel",
 home: "Home",
 motor_commercial: "Commercial Motor",
 liability: "Liability",
 business: "Business",
 agriculture: "Agriculture",
 micro_social: "Govt Schemes",
 specialty: "Specialty",
 personal_accident: "Personal Accident",
 group: "Group",
};

/* Popular categories shown first, then specialized ones */
export const ALL_CATEGORIES = [
 "health", "life", "car", "bike", "travel", "home",
 "motor_commercial", "liability", "business", "agriculture", "micro_social", "specialty", "personal_accident", "group"
];

export const POPULAR_CATEGORIES = ["health", "life", "car", "bike", "travel", "home"];
export const SPECIALIZED_CATEGORIES = ["motor_commercial", "liability", "business", "agriculture", "micro_social", "specialty", "personal_accident", "group"];
