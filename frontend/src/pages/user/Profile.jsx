import { useEffect, useState } from "react";
import { User, Mail, MapPin, Phone, Edit, Shield, Activity, Award } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/Loader";
import { Button, Card, Input, PageHeader, Badge } from "../../components/common";
import { normalizeRole } from "../../utils/auth";

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.1 }
 }
};

const itemVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Profile() {
 const { setUser } = useAuth();
 const [profile, setProfile] = useState(null);
 const [loading, setLoading] = useState(true);
 const [isEditing, setIsEditing] = useState(false);
 const [saving, setSaving] = useState(false);
 
 const [formData, setFormData] = useState({
 fullName: "",
 mobileNumber: "",
 city: "",
 state: "",
 kycDetails: { panCardNumber: "", aadhaarNumber: "" },
 addressInfo: { billingAddress: "", permanentAddress: "" },
 });

 useEffect(() => {
 fetchProfile();
 }, []);

 const fetchProfile = async () => {
 try {
 const { data } = await api.get("/users/profile");
 setProfile(data);
 setFormData({
 fullName: data.fullName || "",
 mobileNumber: data.mobileNumber || "",
 city: data.city || "",
 state: data.state || "",
 kycDetails: {
 panCardNumber: data.kycDetails?.panCardNumber || "",
 aadhaarNumber: data.kycDetails?.aadhaarNumber || "",
 },
 addressInfo: {
 billingAddress: data.addressInfo?.billingAddress || "",
 permanentAddress: data.addressInfo?.permanentAddress || "",
 },
 });
 } catch {
 toast.error("Failed to load profile data");
 } finally {
 setLoading(false);
 }
 };

 const handleUpdate = async (e) => {
 e.preventDefault();
 setSaving(true);
 try {
 const { data } = await api.put("/users/profile", formData);
 setProfile(data);
 setUser(data);
 setIsEditing(false);
 toast.success("Profile updated successfully");
 } catch (error) {
 toast.error(error.response?.data?.message || "Failed to update profile");
 } finally {
 setSaving(false);
 }
 };

 const initials = profile?.fullName
 ? profile.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
 : "U";

 if (loading) return <Loader label="Loading profile..." />;

 const purchasedCount = profile?.purchasedPolicies?.length || 0;
 const memberSince = new Date(profile?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" });
 const normalizedRole = normalizeRole(profile?.role);

 return (
 <motion.div
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 className="page-shell max-w-5xl mx-auto"
 >
 <PageHeader 
 title="Account Settings" 
 subtitle="Manage your profile information and preferences" 
 icon={User}
 />

 <div className="grid gap-8 lg:grid-cols-3">
 {/* Left Sidebar - Profile Card */}
 <motion.div variants={itemVariants} className="space-y-6">
 <Card padding={false} className="overflow-hidden">
 <div className="h-32 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500" />
 <div className="px-6 pb-6 text-center">
 <div className="relative mx-auto -mt-16 mb-4 h-32 w-32 rounded-full border-4 border-white bg-slate-100 shadow-xl">
 <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 ">
 <span className="text-4xl font-bold tracking-tighter text-slate-400 ">
 {initials}
 </span>
 </div>
 {normalizedRole === "ADMIN" && (
 <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-violet-500 text-white " title="Admin">
 <Shield className="h-4 w-4" />
 </div>
 )}
 </div>
 
 <h2 className="text-xl font-bold text-slate-900 ">
 {profile?.fullName}
 </h2>
 <p className="text-sm text-slate-500 ">
 {profile?.email}
 </p>
 
 <div className="mt-4 flex flex-wrap justify-center gap-2">
 <Badge color={normalizedRole === "ADMIN" ? "purple" : "info"} dot>
 {normalizedRole}
 </Badge>
 <Badge color="success">Verified</Badge>
 </div>

 <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 ">
 <div className="text-center">
 <p className="text-2xl font-bold text-slate-900 ">{purchasedCount}</p>
 <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Policies</p>
 </div>
 <div className="text-center">
 <p className="text-sm font-bold text-slate-900 mt-1">{memberSince}</p>
 <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Joined</p>
 </div>
 </div>
 </div>
 </Card>

 {/* Quick Stats */}
 <Card>
 <h3 className="font-semibold text-slate-900 mb-4">Account Status</h3>
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ">
 <Activity className="h-5 w-5 text-emerald-500" />
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 ">Active Profile</p>
 <p className="text-xs text-slate-500">Your account is in good standing</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 ">
 <Award className="h-5 w-5 text-primary-500" />
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900 ">Gold Member</p>
 <p className="text-xs text-slate-500">Premium support unlocked</p>
 </div>
 </div>
 </div>
 </Card>
 </motion.div>

 {/* Right Content - Forms */}
 <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
 <Card
 header={
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-lg font-bold text-slate-900 ">Personal Information</h2>
 <p className="text-sm text-slate-500">Update your contact and billing details</p>
 </div>
 {!isEditing && (
 <Button variant="ghost" size="sm" icon={Edit} onClick={() => setIsEditing(true)}>
 Edit
 </Button>
 )}
 </div>
 }
 >
 {isEditing ? (
 <form onSubmit={handleUpdate} className="space-y-6">
 <div className="grid gap-5 sm:grid-cols-2">
 <Input 
 label="Full Name" 
 icon={User} 
 value={formData.fullName} 
 onChange={e => setFormData({ ...formData, fullName: e.target.value })}
 required
 />
 <Input 
 label="Mobile Number" 
 icon={Phone} 
 type="tel"
 value={formData.mobileNumber} 
 onChange={e => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
 />
 </div>
 <div className="grid gap-5 sm:grid-cols-2">
 <Input 
 label="City" 
 icon={MapPin}
 value={formData.city} 
 onChange={e => setFormData({ ...formData, city: e.target.value })}
 />
 <Input 
 label="State" 
 icon={MapPin}
 value={formData.state} 
 onChange={e => setFormData({ ...formData, state: e.target.value })}
 />
 </div>
 <div className="grid gap-5 sm:grid-cols-2">
 <Input 
 label="Billing Address" 
 icon={MapPin}
 value={formData.addressInfo.billingAddress} 
 onChange={e => setFormData({ ...formData, addressInfo: { ...formData.addressInfo, billingAddress: e.target.value } })}
 />
 <Input 
 label="Permanent Address" 
 icon={MapPin}
 value={formData.addressInfo.permanentAddress} 
 onChange={e => setFormData({ ...formData, addressInfo: { ...formData.addressInfo, permanentAddress: e.target.value } })}
 />
 </div>
 <div className="divider"></div>
 <h3 className="font-semibold text-slate-900 ">KYC Verification</h3>
 <div className="grid gap-5 sm:grid-cols-2">
 <Input 
 label="PAN Card Number" 
 icon={Shield}
 value={formData.kycDetails.panCardNumber} 
 onChange={e => setFormData({ ...formData, kycDetails: { ...formData.kycDetails, panCardNumber: e.target.value.toUpperCase() } })}
 />
 <Input 
 label="Aadhaar Number" 
 icon={Shield}
 value={formData.kycDetails.aadhaarNumber} 
 onChange={e => setFormData({ ...formData, kycDetails: { ...formData.kycDetails, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) } })}
 />
 </div>
 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 ">
 <Button variant="ghost" type="button" onClick={() => {
 setIsEditing(false);
 // Reset
 setFormData({
 fullName: profile?.fullName || "",
 mobileNumber: profile?.mobileNumber || "",
 city: profile?.city || "",
 state: profile?.state || "",
 kycDetails: {
 panCardNumber: profile?.kycDetails?.panCardNumber || "",
 aadhaarNumber: profile?.kycDetails?.aadhaarNumber || "",
 },
 addressInfo: {
 billingAddress: profile?.addressInfo?.billingAddress || "",
 permanentAddress: profile?.addressInfo?.permanentAddress || "",
 },
 });
 }}>
 Cancel
 </Button>
 <Button type="submit" loading={saving}>
 Save Changes
 </Button>
 </div>
 </form>
 ) : (
 <div className="grid gap-6 sm:grid-cols-2">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</p>
 <p className="mt-1 flex items-center gap-2 font-medium text-slate-900 ">
 <User className="h-4 w-4 text-slate-400" /> {profile?.fullName || "—"}
 </p>
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</p>
 <p className="mt-1 flex items-center gap-2 font-medium text-slate-900 ">
 <Mail className="h-4 w-4 text-slate-400" /> {profile?.email || "—"}
 </p>
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</p>
 <p className="mt-1 flex items-center gap-2 font-medium text-slate-900 ">
 <Phone className="h-4 w-4 text-slate-400" /> {profile?.mobileNumber || "—"}
 </p>
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</p>
 <p className="mt-1 flex items-start gap-2 font-medium text-slate-900 ">
 <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> 
 <span>
 {profile?.city ? `${profile.city}, ` : ""}
 {profile?.state ? `${profile.state}` : (!profile?.city && "—")}
 {(profile?.addressInfo?.billingAddress || profile?.addressInfo?.permanentAddress) && (
 <span className="block text-xs font-normal text-slate-500 mt-1">
 {profile?.addressInfo?.billingAddress || profile?.addressInfo?.permanentAddress}
 </span>
 )}
 </span>
 </p>
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-slate-500">KYC Status</p>
 <p className="mt-1 flex items-center gap-2 font-medium text-slate-900 ">
 <Shield className="h-4 w-4 text-slate-400" /> 
 {profile?.kycDetails?.isKycVerified ? (
 <span className="text-emerald-500">Verified</span>
 ) : profile?.kycDetails?.panCardNumber ? (
 <span className="text-amber-500">Pending Verification</span>
 ) : "Not Provided"}
 </p>
 </div>
 </div>
 )}
 </Card>

 {/* Security Panel */}
 <Card>
 <h3 className="font-semibold text-slate-900 mb-6">Security Settings</h3>
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-slate-900 ">Password</p>
 <p className="text-sm text-slate-500 mt-0.5">Last changed 3 months ago</p>
 </div>
 <Button variant="secondary" size="sm">Update</Button>
 </div>
 <div className="divider" />
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-slate-900 ">Two-Factor Authentication</p>
 <p className="text-sm text-slate-500 mt-0.5">Add an extra layer of security</p>
 </div>
 <Badge color="default">Not Enabled</Badge>
 </div>
 </div>
 </Card>
 </motion.div>
 </div>
 </motion.div>
 );
}
