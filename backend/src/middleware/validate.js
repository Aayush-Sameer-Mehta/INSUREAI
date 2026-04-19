/**
 * Generic Zod validation middleware.
 * Validates req.body against the provided schema.
 */
export default function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        req.body = result.data; // use the parsed (transformed) data
        next();
    };
}
