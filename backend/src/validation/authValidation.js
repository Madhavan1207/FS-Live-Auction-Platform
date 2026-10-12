import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(72).required(),
  role: Joi.string().valid("buyer", "seller", "admin").default("buyer"),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});
