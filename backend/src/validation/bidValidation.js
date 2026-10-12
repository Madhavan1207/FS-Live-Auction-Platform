import Joi from "joi";

// As of Experiment 6, bidderName/bidder are taken from the authenticated
// user (req.user), not the request body — otherwise anyone could place a
// bid claiming to be someone else. The client only ever sends the amount.
export const placeBidSchema = Joi.object({
  amount: Joi.number().positive().required(),
});
