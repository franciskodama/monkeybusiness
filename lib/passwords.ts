import { hash, genSalt } from 'bcrypt-ts';

export const saltAndHashPassword = async (
  password: string
): Promise<string> => {
  const saltRounds = 10;
  const salt = await genSalt(saltRounds);
  const hashedPassword = await hash(password, salt);
  return hashedPassword;
};
