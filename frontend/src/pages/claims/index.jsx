import { useEffect, useState, useCallback } from "react";
import {
 FileWarning,
 Plus,
 Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { getMyClaims } from "../../services/claimService";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useDebounce } from "../../hooks/useDebounce";
import { Button, Card, Input, EmptyState, PageHeader } from "../../components/common";
import ClaimCard from "./ClaimCard";
import FileClaimModal from "./FileClaimModal";

export default function Claims() {
 const [claims, setClaims] = useState([]);
 const [policies, setPolicies] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const debouncedSearch = useDebounce(searchQuery, 300);

 const fetchData = useCallback(async () => {
 try {
 setLoading(true);
 const [claimsData, profileRes] = await Promise.all([
 getMyClaims(),
 api.get("/users/profile"),
 ]);
 const filteredClaims = claimsData.filter((claim) => {
 if (!debouncedSearch.trim()) return true;
 const query = debouncedSearch.toLowerCase();
 return [claim.claimId, claim.reason, claim.policy?.name, claim.status]
 .some((value) => String(value || "").toLowerCase().includes(query));
 });
 setClaims(filteredClaims);
 setPolicies(profileRes.data?.purchasedPolicies || []);
 } catch {
 toast.error("Failed to load claims & policies");
 } finally {
 setLoading(false);
 }
 }, [debouncedSearch]);

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 if (loading && claims.length === 0) return <Loader label="Loading claims..." />;

 const activeClaims = claims.filter((c) => c.status !== "Rejected" && c.status !== "Paid");
 const pastClaims = claims.filter((c) => c.status === "Rejected" || c.status === "Paid");

 return (
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-shell">
 <PageHeader
 title="My Claims"
 subtitle="Track and manage your insurance claims"
 icon={FileWarning}
 actions={
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
 <Input icon={Search} placeholder="Search claims..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-64" />
 <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">File New Claim</Button>
 </div>
 }
 />

 {claims.length === 0 && !searchQuery ? (
 <Card variant="glass">
 <EmptyState icon={FileWarning} title="No claims filed yet" description="You haven't filed any insurance claims. Need to submit one?" actionLabel="File New Claim" actionIcon={Plus} onAction={() => setIsModalOpen(true)} />
 </Card>
 ) : (
 <div className="space-y-6">
 {activeClaims.length > 0 && (
 <section>
 <h2 className="section-title mb-4 text-lg">Active Claims</h2>
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {activeClaims.map((claim, idx) => (
 <ClaimCard key={claim._id} claim={claim} index={idx} />
 ))}
 </div>
 </section>
 )}
 {pastClaims.length > 0 && (
 <section>
 <h2 className="section-title mb-4 text-lg mt-8">Past Claims</h2>
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {pastClaims.map((claim, idx) => (
 <ClaimCard key={claim._id} claim={claim} index={idx} isPast />
 ))}
 </div>
 </section>
 )}
 {claims.length === 0 && searchQuery && (
 <div className="py-12 text-center text-slate-500">No claims found matching "{searchQuery}"</div>
 )}
 </div>
 )}

 <FileClaimModal
 open={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 policies={policies}
 onSuccess={fetchData}
 />
 </motion.div>
 );
}
