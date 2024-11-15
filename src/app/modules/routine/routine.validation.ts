import { z } from "zod";
import { RoutineTypes } from "./routine.constant";

const createRoutineSchema = z.object({
    body: z.object({
        type: z.enum([...RoutineTypes] as [string, ...string[]], {
            required_error: 'Routine type is required.',
        }),
        date: z
            .string()
            .datetime({ message: 'Invalid date format' })
            .min(1, 'Date is required'),
    })})
    export const RoutineValidation = { createRoutineSchema };
