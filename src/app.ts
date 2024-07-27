import express from "express";
import { prisma } from "../prisma/prisma-instance";
import {
  errorHandleMiddleware,
  validateDogID,
} from "./error-handler";
import "express-async-errors";
import HttpStatusCode from "./status-codes";
import { validateData } from "./utils/helpers";

const { OK, BAD_REQUEST } = HttpStatusCode;

const app = express();
app.use(express.json());
// All code should go below this line

app.get("/", async (_req, res) => {
  return await res
    .status(OK)
    .json({ message: "Hello World!" }); // the 'status' is unnecessary but wanted to show you how to define a status
});

app.get("/dogs", async (req, res) => {
  const dogs = await prisma.dog.findMany({});
  return res.status(200).send(dogs);
});

app.get("/dogs/:id", validateDogID, async (req, res) => {
  //const id = +req.params.id;
  const id = parseInt(req.params.id);

  try {
    const dog = await prisma.dog.findUnique({
      where: {
        id,
      },
    });

    if (!dog) {
      return res.sendStatus(204);
    }
    return res.send(dog);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Internal server error" });
  }
});
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
  if (validationResult.length) {
    validationResult.forEach((invalidKey) =>
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

app.patch("/dogs/:id", validateDogID, async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const validationResult = validateData(body);

  const errors: string[] = [];

  if (!validationResult.length) {
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
    validationResult.forEach((invalidKey) =>
      errors.push(`'${invalidKey}' is not a valid key`)
    );
    res.status(BAD_REQUEST).json({ errors });
  }
});

app.delete("/dogs/:id", validateDogID, async (req, res) => {
  const id = parseInt(req.params.id);

  return await prisma.dog
    .delete({ where: { id } })
    .then((deletedDog) => res.status(200).json(deletedDog))
    .catch(() =>
      res.status(204).json({ message: "Dog not found" })
    );
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
