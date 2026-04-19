import agentService from "./agentService";

class ClientService {
 static async getClients(filters = {}) {
 return agentService.getClients(filters);
 }

 static async getClientById(clientId) {
 return agentService.getClientById(clientId);
 }

 static async addClient(clientData) {
 return agentService.addClient(clientData);
 }

 static async updateClient(clientId, clientData) {
 return agentService.updateClient(clientId, clientData);
 }

 static async deleteClient(clientId) {
 return agentService.deleteClient(clientId);
 }

 static async getClientPolicies(clientId) {
 return agentService.getClientPolicies(clientId);
 }

 static async getClientClaims(clientId) {
 return agentService.getClientClaims(clientId);
 }

 /**
 * Format client data for display
 */
 static formatClient(client) {
 return {
 ...client,
 fullName: `${client.firstName} ${client.lastName}`,
 phone: `+91 ${client.phone}`,
 status: client.status || "ACTIVE",
 kycStatus: client.kycStatus || "PENDING",
 };
 }

 /**
 * Validate client form data
 */
 static validateClientData(data) {
 const errors = {};

 if (!data.firstName?.trim()) {
 errors.firstName = "First name is required";
 }

 if (!data.lastName?.trim()) {
 errors.lastName = "Last name is required";
 }

 if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
 errors.email = "Valid email is required";
 }

 if (!data.phone?.match(/^[0-9]{10}$/)) {
 errors.phone = "Valid 10-digit phone number is required";
 }

 if (!data.dateOfBirth) {
 errors.dateOfBirth = "Date of birth is required";
 }

 // Validate age (must be >= 18)
 const birthDate = new Date(data.dateOfBirth);
 const age = new Date().getFullYear() - birthDate.getFullYear();
 if (age < 18) {
 errors.dateOfBirth = "Must be 18 or older";
 }

 if (!data.address?.trim()) {
 errors.address = "Address is required";
 }

 if (!data.city?.trim()) {
 errors.city = "City is required";
 }

 if (!data.state?.trim()) {
 errors.state = "State is required";
 }

 if (!data.pincode?.match(/^[0-9]{6}$/)) {
 errors.pincode = "Valid 6-digit pincode is required";
 }

 return errors;
 }

 /**
 * Generate client summary
 */
 static getClientSummary(client, policies = [], claims = []) {
 return {
 personalInfo: {
 name: `${client.firstName} ${client.lastName}`,
 email: client.email,
 phone: client.phone,
 dob: new Date(client.dateOfBirth).toLocaleDateString("en-IN"),
 age: this.calculateAge(client.dateOfBirth),
 },
 policies: {
 total: policies.length,
 active: policies.filter((p) => p.status === "ACTIVE").length,
 expired: policies.filter((p) => p.status === "EXPIRED").length,
 totalPremium: policies.reduce((sum, p) => sum + (p.premium || 0), 0),
 },
 claims: {
 total: claims.length,
 approved: claims.filter((c) => c.status === "APPROVED").length,
 pending: claims.filter((c) => c.status === "PENDING").length,
 totalAmount: claims
 .filter((c) => c.status === "APPROVED")
 .reduce((sum, c) => sum + (c.amount || 0), 0),
 },
 };
 }

 /**
 * Calculate age from date of birth
 */
 static calculateAge(dob) {
 const today = new Date();
 const birthDate = new Date(dob);
 let age = today.getFullYear() - birthDate.getFullYear();
 const monthDiff = today.getMonth() - birthDate.getMonth();
 if (
 monthDiff < 0 ||
 (monthDiff === 0 && today.getDate() < birthDate.getDate())
 ) {
 age--;
 }
 return age;
 }

 /**
 * Export client data to CSV
 */
 static exportClientsToCSV(clients) {
 const headers = ["Name", "Email", "Phone", "Active Policies", "Status"];
 const rows = clients.map((client) => [
 `${client.firstName} ${client.lastName}`,
 client.email,
 client.phone,
 client.policiesCount || 0,
 client.status,
 ]);

 const csvContent = [
 headers.join(","),
 ...rows.map((row) => row.join(",")),
 ].join("\n");

 const blob = new Blob([csvContent], { type: "text/csv" });
 const url = window.URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.href = url;
 link.download = `clients_${new Date().toISOString().split("T")[0]}.csv`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 }
}

export default ClientService;
