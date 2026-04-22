import { lazy, memo, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleDashboardRedirect from "./components/RoleDashboardRedirect";

const Chatbot = lazy(() => import("./components/Chatbot"));

const Home = lazy(() => import("./pages/Home"));
const Policies = lazy(() => import("./pages/policies/Policies"));
const PolicyDetails = lazy(() => import("./pages/policies/PolicyDetails"));
const ComparePolicies = lazy(() => import("./pages/policies/ComparePolicies"));
const PremiumCalculator = lazy(() => import("./pages/policies/PremiumCalculator"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Payment = lazy(() => import("./pages/user/Payment"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Recommendations = lazy(() => import("./pages/recommendations"));
const Renewals = lazy(() => import("./pages/user/Renewals"));
const Profile = lazy(() => import("./pages/user/Profile"));
const Claims = lazy(() => import("./pages/claims"));
const MyPolicies = lazy(() => import("./pages/user/MyPolicies"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const UserOnboarding = lazy(() => import("./pages/user/UserOnboarding"));
const InsurancePreferences = lazy(() => import("./pages/user/InsurancePreferences"));

/* ─── Admin Pages ────────────────────────────────── */
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPolicies = lazy(() => import("./pages/admin/AdminPolicies"));
const AdminClaims = lazy(() => import("./pages/admin/AdminClaims"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminPremiumAnalytics = lazy(
 () => import("./pages/admin/AdminPremiumAnalytics"),
);
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminPolicyForm = lazy(() => import("./pages/admin/AdminPolicyForm"));

const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

/* ─── Page transition wrapper ────────────────────── */
const pageTransition = {
 initial: { opacity: 0, y: 12 },
 animate: { opacity: 1, y: 0 },
 exit: { opacity: 0, y: -8 },
 transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

const PageWrapper = memo(function PageWrapper({ children }) {
 return <motion.div {...pageTransition}>{children}</motion.div>;
});

export default function App() {
 const location = useLocation();
 const isHome = location.pathname === "/";
 const isAdmin = location.pathname.startsWith("/admin");
 const isPolicies = location.pathname === "/policies";

 return (
 <div className="min-h-screen overflow-x-hidden text-slate-900 ">
 <Navbar />
 <main
 className={
 isHome || isAdmin
 ? "w-full"
 : isPolicies
 ? "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
 : "mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6 py-6 sm:py-8"
 }
 >
 <Suspense fallback={<Loader />}>
 <AnimatePresence mode="wait">
 <Routes location={location} key={location.pathname}>
 <Route
 path="/"
 element={
 <PageWrapper>
 <Home />
 </PageWrapper>
 }
 />
 <Route
 path="/policies"
 element={
 <PageWrapper>
 <Policies />
 </PageWrapper>
 }
 />
 <Route
 path="/policies/:id"
 element={
 <PageWrapper>
 <PolicyDetails />
 </PageWrapper>
 }
 />
 <Route
 path="/compare-policies"
 element={
 <PageWrapper>
 <ComparePolicies />
 </PageWrapper>
 }
 />
 <Route
 path="/premium-calculator"
 element={
 <PageWrapper>
 <PremiumCalculator />
 </PageWrapper>
 }
 />
 <Route
 path="/recommendations"
 element={
 <PageWrapper>
 <Recommendations />
 </PageWrapper>
 }
 />
 <Route
 path="/login"
 element={
 <PageWrapper>
 <Login />
 </PageWrapper>
 }
 />
 <Route
 path="/register"
 element={
 <PageWrapper>
 <Register />
 </PageWrapper>
 }
 />
 <Route
 path="/forgot-password"
 element={
 <PageWrapper>
 <ForgotPassword />
 </PageWrapper>
 }
 />
 <Route
 path="/reset-password"
 element={
 <PageWrapper>
 <ResetPassword />
 </PageWrapper>
 }
 />
 <Route element={<ProtectedRoute />}>
 <Route
 path="/dashboard"
 element={
 <PageWrapper>
 <RoleDashboardRedirect />
 </PageWrapper>
 }
 />
 </Route>
 <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
 <Route
 path="/user/dashboard"
 element={
 <PageWrapper>
 <Dashboard />
 </PageWrapper>
 }
 />
 <Route
 path="/my-policies"
 element={
 <PageWrapper>
 <MyPolicies />
 </PageWrapper>
 }
 />
 <Route
 path="/renewals"
 element={
 <PageWrapper>
 <Renewals />
 </PageWrapper>
 }
 />
 <Route
 path="/profile"
 element={
 <PageWrapper>
 <Profile />
 </PageWrapper>
 }
 />
 <Route
 path="/onboarding"
 element={
 <PageWrapper>
 <UserOnboarding />
 </PageWrapper>
 }
 />
 <Route
 path="/preferences"
 element={
 <PageWrapper>
 <InsurancePreferences />
 </PageWrapper>
 }
 />
 <Route
 path="/claims"
 element={
 <PageWrapper>
 <Claims />
 </PageWrapper>
 }
 />
 <Route
 path="/payment/:policyId"
 element={
 <PageWrapper>
 <Payment />
 </PageWrapper>
 }
 />
 </Route>
 {/* ─── Admin Routes (Admin only) ─── */}
 <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
 <Route path="/admin" element={<AdminLayout />}>
 <Route path="dashboard" element={<AdminDashboard />} />
 <Route index element={<AdminDashboard />} />
 <Route path="users" element={<AdminUsers />} />
 <Route path="policies" element={<AdminPolicies />} />
 <Route path="policies/new" element={<AdminPolicyForm />} />
 <Route path="policies/:id/edit" element={<AdminPolicyForm />} />
 <Route path="claims" element={<AdminClaims />} />
 <Route path="payments" element={<AdminPayments />} />
 <Route path="analytics" element={<AdminPremiumAnalytics />} />
 <Route path="reports" element={<AdminReports />} />
 <Route path="settings" element={<AdminSettings />} />
 </Route>
 </Route>
 <Route
 path="/admin/dashboard"
 element={<Navigate to="/admin" replace />}
 />
 <Route
 path="/contact"
 element={
 <PageWrapper>
 <Contact />
 </PageWrapper>
 }
 />
 <Route
 path="*"
 element={
 <PageWrapper>
 <NotFoundPage />
 </PageWrapper>
 }
 />
 </Routes>
 </AnimatePresence>
 </Suspense>
 </main>
 <Footer />
 <Suspense fallback={null}>
 <Chatbot />
 </Suspense>
 <Toaster
 position="top-right"
 toastOptions={{
 className:
 "!rounded-xl !border !border-slate-200 !bg-white !text-slate-900 ",
 duration: 3000,
 }}
 />
 </div>
 );
}
