import yup from "yup";

export const userValidateSchema = yup.object({
    userName: yup
        .string()
        .trim()
        .min(3, "UserName must be atleast 3 characters")
        .required(),
    email: yup.string().email("The email is not valid one").required(),
    // password: yup.string().min(4, "Password must be atleast 4 characters"),
    password: yup.string()
  .required('Please Enter your password')
  .trim()
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
    "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
  )
});

export const validateUser = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ errors: err.errors });
    }
};