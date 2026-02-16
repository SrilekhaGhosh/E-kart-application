import yup from "yup";
export const todoValidateSchema = yup.object({
    title: yup
        .string()
        .trim()
        .min(3, "Title must be at least 3 characters")
        .required("Title is required"),

    description: yup
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(200, "Description must not exceed 200 characters")
        .required("Description is required"),
});


export const validateTodo = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ errors: err.errors });
    }
};