import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line
//

app.get("/", (_req, res) => {
  return res.status(200).json({ message: "Hello World!" }); // the 'status' is unnecessary but wanted to show you how to define a status
});

app.get("/dogs", async (req, res) => {
  const nameHas = req.query.nameHas as string; //makes it so the URL params can be used to fetch specified data
  console.log({ nameHas });

  const dogs = await prisma.dog.findMany({
    where: {
      name: {
        contains: nameHas,
      },
    },
  });
  console.log("dogs =>", dogs);
  return res.status(200).send(dogs);
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
