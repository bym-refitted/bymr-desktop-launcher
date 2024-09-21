export const validateUsername = (username: string): string => {
  if (username.length < 2) {
    return "Usernames must be at least 2 characters long";
  } else if (username.length > 12) {
    return "Usernames cannot be longer than 12 characters";
  } else {
    return "";
  }
};

export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  } else {
    return "";
  }
};

export const validatePassword = (password: string): string => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters long, contain at least 1 uppercase letter, and 1 special character";
  } else {
    return "";
  }
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
  isRegisterForm: boolean
): string => {
  if (isRegisterForm && confirmPassword !== password) {
    return "Passwords do not match";
  } else {
    return "";
  }
};
