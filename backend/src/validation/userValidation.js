import Joi from "joi";

// Password strength/hashing rules are a placeholder here — real hashing
// (bcrypt) is Experiment 6. This only validates length/shape at the API
// boundary before anything reaches the database.
export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(72).required(),
  role: Joi.string().valid("buyer", "seller", "admin").default("buyer"),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  email: Joi.string().trim().lowercase().email(),
  password: Joi.string().min(6).max(72),
  role: Joi.string().valid("buyer", "seller", "admin"),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });
