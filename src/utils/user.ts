import axios from "./axios";

export async function RegisterUser(data: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const res = await axios.post("/auth/register", data);
  localStorage.setItem("token", res.data.token);
  return res.data.user;
}

export async function LoginUser(email: string, password: string) {
  const res = await axios.post("/auth/login", { email, password });
  localStorage.setItem("token", res.data.token);
  return res.data.user;
}

export async function GetUser(uid: string) {
  const res = await axios.get(`/users/${uid}`);
  return res.data;
}
