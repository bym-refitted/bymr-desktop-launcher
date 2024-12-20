export const validateUsername = (username: string): string => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return "Usernames can only contain numbers and letters";
  } else if (username.length < 2) {
    return "Usernames must be at least 2 characters long";
  } else if (username.length > 12) {
    return "Usernames cannot be longer than 12 characters";
  } else {
    return "";
  }
};

export const validateEmail = (email: string): string => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  } else {
    return "";
  }
};

export const validatePassword = (password: string): string => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[`~<>?,./!@#$%^&*()\-_\+="|'{}[\];:\\]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character";
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
