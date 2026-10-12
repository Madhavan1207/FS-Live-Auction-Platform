// One reusable middleware factory instead of writing the same
// "check errors, respond 400" logic in every controller. Routes pass in
// which Joi schema applies to their body:
//   router.post("/", validate(createItemSchema), asyncHandler(createItem));
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // collect every validation error, not just the first
      stripUnknown: true, // silently drop fields the schema doesn't expect
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    req.body = value; // use the cleaned/defaulted value going forward
    next();
  };
}
