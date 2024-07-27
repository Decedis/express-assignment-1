import { Dog } from "@prisma/client";

export function validateData(body: Dog) {
  const validKeys = ["name", "description", "breed", "age"];
  return Object.keys(body).filter(
    (key) => !validKeys.includes(key)
  );
}
