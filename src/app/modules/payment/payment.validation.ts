import { z } from "zod";
import { SubscriptionPlans } from "./payment.constant";

const createSubscriptionPayment = z.object({
    body: z.object({
        requestedPlan:z
        .enum([...SubscriptionPlans] as [string, ...string[]],{
            required_error: 'Requested subscription plan is required.',
        })
    }).strict()
})

export const PaymentValidation = { createSubscriptionPayment };