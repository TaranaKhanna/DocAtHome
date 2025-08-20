import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi, getMe } from "../api";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";

// --- Predefined Options ---
const doctorSpecialties = [
  "Cardiologist",
  "Dermatologist",
  "Gynecologist",
  "Dentist",
  "Pediatrician",
  "General Physician",
];
const nurseCategories = [
  "Elder Care",
  "Child Care",
  "Post-Operative Care",
  "General Nursing (GNM)",
  "Auxiliary Nursing (ANM)",
];
const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
  "Patna",
  "Kolkata",
  "Chennai",
];
const experienceLevels = Array.from({ length: 30 }, (_, i) => i + 1);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialty: "",
    city: "",
    experience: "",
    licenseNumber: "",
    govId: "",
    certificationId: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const { role, password, confirmPassword } = formData;
  const isProfessional = role === "doctor" || role === "nurse";

  const validateField = (name, value, allFormData = formData) => {
    switch (name) {
      case "password":
        if (value.length < 6) return "Password must be at least 6 characters.";
        break;
      case "confirmPassword":
        if (value.length < 6) return "Password must be at least 6 characters.";
        if (allFormData.password !== value) return "Passwords do not match.";
        break;
    }
    return "";
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "password") {
      const confirmPasswordError = validateField(
        "confirmPassword",
        confirmPassword,
      );
      setErrors((prev) => ({ ...prev, confirmPassword: confirmPasswordError }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (isProfessional) {
        payload.specialty = formData.specialty;
        payload.city = formData.city;
        payload.experience = formData.experience;
        payload.licenseNumber = formData.licenseNumber;
        payload.govId = formData.govId;
      }
      if (role === "technician") {
        payload.certificationId = formData.certificationId;
      }

      const { data } = await registerApi(payload);
      localStorage.setItem("token", data.token);

      const { data: userData } = await getMe();
      login(userData);

      toast.success("Registration successful!");

      if (userData.role === "patient") {
        navigate("/dashboard");
      } else {
        toast.success("Your account is pending admin approval.");
        navigate("/");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="flex justify-center items-center mt-10 mb-20">
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-secondary-dark p-8 rounded-lg shadow-lg w-full max-w-2xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
          Create Your Account
        </h2>

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block text-slate-700 dark:text-secondary-text mb-2">
            I am a...
          </label>
          <select
            name="role"
            value={role}
            onChange={onChange}
            className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded text-black dark:text-white border-gray-700"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="technician">Lab Technician</option>
          </select>
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-secondary-text mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border border-gray-700 text-black dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-secondary-text mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              required
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border border-gray-700 text-black dark:text-white"
            />
          </div>
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-slate-700 dark:text-secondary-text mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              required
              minLength="6"
              className={`w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border text-black dark:text-white ${
                errors.password ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-slate-700 dark:text-secondary-text mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={onChange}
              required
              minLength="6"
              className={`w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border text-black dark:text-white ${
                errors.confirmPassword ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Professional Fields */}
        {isProfessional && (
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-semibold text-accent-blue mb-4">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-slate-700 dark:text-secondary-text mb-2">
                  {role === "doctor" ? "Specialty" : "Nurse Category"}
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={onChange}
                  required
                  className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700"
                >
                  <option value="">Select an option</option>
                  {(role === "doctor"
                    ? doctorSpecialties
                    : nurseCategories
                  ).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-slate-700 dark:text-secondary-text mb-2">
                  City
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={onChange}
                  required
                  className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-slate-700 dark:text-secondary-text mb-2">
                  Experience (Years)
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={onChange}
                  required
                  className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700"
                >
                  <option value="">Select Years</option>
                  {experienceLevels.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-slate-700 dark:text-secondary-text mb-2">
                  Medical License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={onChange}
                  required
                  className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border-gray-700 text-black dark:text-white"
                />
              </div>
              <div className="mb-4 md:col-span-2">
                <label className="block text-slate-700 dark:text-secondary-text mb-2">
                  Aadhaar / Voter ID / Government ID Number
                </label>
                <input
                  type="text"
                  name="govId"
                  value={formData.govId}
                  onChange={onChange}
                  required
                  className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border-gray-700 text-black dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {role === "technician" && (
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-secondary-text mb-2">
              Certification ID
            </label>
            <input
              type="text"
              name="certificationId"
              value={formData.certificationId}
              onChange={onChange}
              required
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border-gray-700 text-black dark:text-white"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover mt-6 disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={
            Object.values(errors).some((e) => e !== "") ||
            password !== confirmPassword
          }
        >
          Register
        </button>

        <p className="text-center mt-4 text-secondary-text">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-blue hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
