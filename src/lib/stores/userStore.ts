import { writable } from "svelte/store";

interface User {
  savedEmail: string;
  savedToken?: string;
}

const initialUser: User = {
  savedEmail: "",
  savedToken: "",
};

export const user = writable<User>(initialUser);
export const isUserRemembered = writable<boolean>(false);

export const loadUserFromLocalStorage = () => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    user.set(userData);
    isUserRemembered.set(true);
  }
};

export const saveUserToLocalStorage = (userData: User) => {
  localStorage.setItem("user", JSON.stringify(userData));
  user.set(userData);
  isUserRemembered.set(true);
};

export const removeUserFromLocalStorage = () => {
  localStorage.removeItem("user");
  user.set(initialUser);
  isUserRemembered.set(false);
};
