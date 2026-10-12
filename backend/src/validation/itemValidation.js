import Joi from "joi";

// Experiment 4 relied only on Mongoose's schema-level `required`/`min`
// checks, which run AFTER a request has already reached the controller.
// Joi validates the request body up front, at the API boundary, with
// clearer error messages and rules Mongoose alone can't express (e.g.
// "closingAt must be in the future").

export const createItemSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  category: Joi.string().trim().max(50).default("General"),
  image: Joi.string().uri().allow("").default(""),
  startingPrice: Joi.number().positive().required(),
  closingAt: Joi.date().greater("now").required().messages({
    "date.greater": "closingAt must be a future date/time",
  }),
  // Note: no `seller` field here. As of Experiment 6, the seller is taken
  // from the authenticated user (req.user), never from the request body —
  // otherwise anyone could list an item "as" someone else.
});

// Updates allow a partial body — but at least one real field must be sent,
// and closingAt (if provided) still has to be in the future.
export const updateItemSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120),
  description: Joi.string().trim().min(10).max(2000),
  category: Joi.string().trim().max(50),
  image: Joi.string().uri().allow(""),
  startingPrice: Joi.number().positive(),
  currentBid: Joi.number().min(0),
  bidCount: Joi.number().min(0),
  closingAt: Joi.date().greater("now"),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });
