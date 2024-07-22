import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line

type Dog = {
  age: number;
  name: string;
  description: string;
  breed: string;
};

app.get("/", async (_req, res) => {
  return await res
    .status(200)
    .json({ message: "Hello World!" }); // the 'status' is unnecessary but wanted to show you how to define a status
});

app.get("/dogs", async (req, res) => {
  const nameHas = req.query.nameHas as string; //makes it so the URL params can be used to fetch specified data

  const dogs = await prisma.dog.findMany({
    where: {
      name: {
        contains: nameHas,
      },
    },
  });

  return res.status(200).send(dogs);
});

app.get("/dogs/:id", async (req, res) => {
  //const id = +req.params.id;
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }

  try {
    const dog = await prisma.dog.findUnique({
      where: {
        id,
      },
    });

    if (!dog) {
      return res.status(204).send("No Content");
    }
    return res.send(dog);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Internal server error" });
  }
});

// function validateData(obj: Object): {
//   valid: boolean;
//   invalidKey?: string;
// } {
//   const defaultDog: Dog = {
//     age: 0,
//     name: "",
//     breed: "",
//     description: "",
//   };

//   for (const key in obj) {
//     if (!defaultDog.hasOwnProperty(key)) {
//       return { valid: false, invalidKey: key };
//     }
//   }
//   return { valid: true };
// }

function validateData(
  body: Dog | "name" | "description" | "breed" | "age"
) {
  const validKeys = ["name", "description", "breed", "age"];
  const invalidKeys = Object.keys(body).filter(
    (key) => !validKeys.includes(key)
  );
  return {
    valid: invalidKeys.length === 0,
    invalidKeys,
  };
}

app.post("/dogs/", async (req, res) => {
  const body = req.body;
  const age = body.age;
  const name = body.name;
  const description = body.description;
  const breed = body.breed;

  const errors = [];

  if (typeof name !== "string") {
    errors.push("name should be a string");
  }
  if (typeof age !== "number") {
    errors.push("age should be a number");
  }
  if (
    typeof description !== "string" ||
    description.length === 0
  ) {
    errors.push("description should be a string");
  }

  const validationResult = validateData(body);
  if (
    !validationResult.valid &&
    validationResult.invalidKeys
  ) {
    validationResult.invalidKeys.forEach((invalidKey) =>
      errors.push(`'${invalidKey}' is not a valid key`)
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  try {
    const newCharacter = await prisma.dog.create({
      data: {
        age,
        name,
        description,
        breed,
      },
    });
    return res.status(201).json(newCharacter);
  } catch (e) {
    console.error(e);
    return res.status(400);
  }
});

app.patch("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const validationResult = validateData(body);

  const errors: string[] = [];

  if (validationResult.valid) {
    try {
      const updatedDog = await prisma.dog.update({
        where: { id },
        data: { ...body },
      });
      res.status(201).json(updatedDog);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .json({ error: "Failed to update dog" });
    }
  } else {
    validationResult.invalidKeys.forEach((invalidKey) =>
      errors.push(`'${invalidKey}' is not a valid key`)
    );
    res.status(400).json({ errors });
  }
});

app.delete("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res
      .status(400)
      .json({ message: "id should be a number" });
  }

  const dog = await prisma.dog.findUnique({
    where: { id },
  });
  if (dog) {
    await prisma.dog.delete({ where: { id } });
    res.status(200).json(dog);
  } else {
    res.status(204).json({ message: "Dog not found" });
  }
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
