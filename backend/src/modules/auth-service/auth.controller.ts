import { Router } from "express";

export const authRouter = Router();

authRouter.get("/me", (_request, response) => {
  response.json({
    user: {
      id: "internal-user",
      name: "Platform User",
      role: "Admin"
    }
  });
});
