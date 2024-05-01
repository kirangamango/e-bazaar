export const getPassword = (name: string, dob: Date) => {
  const password = `${name.slice(0, 4)}${dob.getDate()}${dob.getMonth()}`;

  return password;
};
