import api from "./api";

export const addDependent = async (payload) => {
 const { data } = await api.post("/users/dependents", payload);
 return data;
};

export const updateDependent = async (id, payload) => {
 const { data } = await api.put(`/users/dependents/${id}`, payload);
 return data;
};

export const removeDependent = async (id) => {
 const { data } = await api.delete(`/users/dependents/${id}`);
 return data;
};
