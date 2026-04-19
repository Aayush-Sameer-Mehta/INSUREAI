import { useState } from "react";
import { Users, Plus, Trash2, HeartPulse, ShieldCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { Card, Button, Input, Select, Modal } from "../../components/common";
import { addDependent, removeDependent } from "../../services/dependentService";

const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Other"];

export default function DependentsList({ dependents = [], onUpdate }) {
 const [isAdding, setIsAdding] = useState(false);
 const [loading, setLoading] = useState(false);
 const [form, setForm] = useState({ name: "", relationship: "Spouse", dateOfBirth: "", gender: "Male" });

 const handleAdd = async (e) => {
 e.preventDefault();
 if (!form.name) return toast.error("Name is required");

 setLoading(true);
 try {
 const updatedDependents = await addDependent(form);
 onUpdate(updatedDependents);
 toast.success("Dependent added successfully");
 setIsAdding(false);
 setForm({ name: "", relationship: "Spouse", dateOfBirth: "", gender: "Male" });
 } catch (error) {
 toast.error(error.response?.data?.message || "Failed to add dependent");
 } finally {
 setLoading(false);
 }
 };

 const handleDelete = async (id) => {
 if (!window.confirm("Remove this dependent?")) return;
 try {
 const updatedDependents = await removeDependent(id);
 onUpdate(updatedDependents);
 toast.success("Dependent removed");
 } catch {
 toast.error("Failed to remove dependent");
 }
 };

 return (
 <>
 <Card
 padding={false}
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md shadow-indigo-500/20">
 <Users className="h-5 w-5 text-white" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-slate-900 ">Family Dependents</h2>
 <p className="text-xs text-slate-500 ">{dependents.length} registered member{dependents.length !== 1 ? 's' : ''}</p>
 </div>
 </div>
 <Button size="sm" variant="outline" icon={Plus} onClick={() => setIsAdding(true)}>Add</Button>
 </div>
 }
 >
 <div className="divide-y divide-slate-100 ">
 {dependents.length > 0 ? (
 dependents.map((dep) => (
 <div key={dep._id} className="group flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 ">
 <div className="flex items-center gap-4">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 ">
 <HeartPulse className="h-5 w-5 text-indigo-500" />
 </div>
 <div>
 <p className="font-semibold text-slate-900 ">{dep.name}</p>
 <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 ">
 <span className="font-medium text-indigo-600 ">{dep.relationship}</span>
 <span>•</span>
 <span>{dep.gender}</span>
 {dep.dateOfBirth && (
 <>
 <span>•</span>
 <span>{new Date(dep.dateOfBirth).toLocaleDateString()}</span>
 </>
 )}
 </div>
 </div>
 </div>
 <div className="flex items-center gap-3">
 {dep.isCovered ? (
 <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 ">
 <ShieldCheck className="h-3.5 w-3.5" /> Covered
 </span>
 ) : (
 <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 ">
 <ShieldAlert className="h-3.5 w-3.5" /> Uninsured
 </span>
 )}
 <button 
 onClick={() => handleDelete(dep._id)}
 className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </div>
 </div>
 ))
 ) : (
 <div className="flex flex-col items-center justify-center py-8 text-center">
 <Users className="mb-2 h-10 w-10 text-slate-200 " />
 <p className="text-sm font-semibold text-slate-600 ">No dependents added</p>
 <p className="mt-1 text-xs text-slate-400">Add family members to simplify policy tracking</p>
 </div>
 )}
 </div>
 </Card>

 <Modal open={isAdding} onClose={() => setIsAdding(false)} title="Add Family Member">
 <form onSubmit={handleAdd} className="space-y-4">
 <Input 
 label="Full Name" 
 placeholder="John Doe" 
 required 
 value={form.name} 
 onChange={(e) => setForm({ ...form, name: e.target.value })} 
 />
 <div className="grid grid-cols-2 gap-4">
 <Select 
 label="Relationship" 
 value={form.relationship} 
 onChange={(e) => setForm({ ...form, relationship: e.target.value })}
 >
 {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
 </Select>
 <Select 
 label="Gender" 
 value={form.gender} 
 onChange={(e) => setForm({ ...form, gender: e.target.value })}
 >
 <option value="Male">Male</option>
 <option value="Female">Female</option>
 <option value="Other">Other</option>
 </Select>
 </div>
 <Input 
 label="Date of Birth (Optional)" 
 type="date" 
 value={form.dateOfBirth} 
 onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} 
 />
 <div className="mt-6 flex justify-end gap-3">
 <Button variant="ghost" onClick={() => setIsAdding(false)} disabled={loading}>Cancel</Button>
 <Button type="submit" loading={loading}>Save Dependent</Button>
 </div>
 </form>
 </Modal>
 </>
 );
}
