import { writable } from "svelte/store";

interface User {
  savedUsername: string;
  savedEmail: string;
  savedPassword: string;
  savedToken?: string;
}

const initialUser: User = {
  savedUsername: "",
  savedEmail: "",
  savedPassword: "",
};

export const user = writable<User>(initialUser);
export const isUserSaved = writable<boolean>(false);

export const loadUserFromLocalStorage = () => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    user.set(userData);
    isUserSaved.set(true);
  }
};

export const saveUserToLocalStorage = (userData: User) => {
  localStorage.setItem("user", JSON.stringify(userData));
  user.set(userData);
  isUserSaved.set(true);
};

export const removeUserFromLocalStorage = () => {
  localStorage.removeItem("user");
  user.set(initialUser);
  isUserSaved.set(false);
};
