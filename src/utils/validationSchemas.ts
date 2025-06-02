import * as Yup from "yup";
import { DonationType } from "@/types";

// Base validation rules for common fields
export const baseValidationRules = {
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .required("Title is required"),
  
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters")
    .required("Description is required"),
  
  imageUrl: Yup.string()
    .url("Must be a valid URL")
    .required("Image is required"),
  
  tags: Yup.array()
    .of(Yup.string())
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed"),
  
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  
  phoneNumber: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .optional(),
  
  website: Yup.string()
    .url("Invalid URL format")
    .optional(),
};

// Dynamic validation for target amount based on acceptance type
export const createTargetAmountValidation = (acceptanceType: string) => {
  if (acceptanceType === "items") {
    // For items-only causes, target amount is optional (can be 0)
    return Yup.number()
      .min(0, "Target amount cannot be negative")
      .optional();
  } else {
    // For money or both, target amount is required and must be > 0
    return Yup.number()
      .min(1, "Target amount must be greater than 0")
      .required("Target amount is required");
  }
};

// Dynamic validation for donation items based on acceptance type
export const createDonationItemsValidation = (acceptanceType: string) => {
  if (acceptanceType === "money") {
    // For money-only causes, donation items are not required
    return Yup.array().of(Yup.string()).optional();
  } else {
    // For items or both, at least one donation item is required
    return Yup.array()
      .of(Yup.string())
      .min(1, "At least one donation item is required")
      .required("Donation items are required");
  }
};

// Cause validation schemas
export const createCauseValidationSchema = (acceptanceType: string) => {
  return Yup.object().shape({
    title: baseValidationRules.title,
    description: baseValidationRules.description,
    targetAmount: createTargetAmountValidation(acceptanceType),
    imageUrl: baseValidationRules.imageUrl,
    tags: baseValidationRules.tags,
    acceptanceType: Yup.string()
      .oneOf(["money", "items", "both"], "Invalid acceptance type")
      .required("Acceptance type is required"),
    donationItems: createDonationItemsValidation(acceptanceType),
  });
};

export const updateCauseValidationSchema = (acceptanceType: string) => {
  return Yup.object().shape({
    title: baseValidationRules.title,
    description: baseValidationRules.description,
    targetAmount: createTargetAmountValidation(acceptanceType),
    imageUrl: baseValidationRules.imageUrl,
    tags: baseValidationRules.tags,
  });
};

// Campaign validation schemas
export const createCampaignValidationSchema = () => {
  return Yup.object().shape({
    title: baseValidationRules.title,
    description: baseValidationRules.description,
    totalTargetAmount: Yup.number()
      .min(1, "Total target amount must be greater than 0")
      .required("Total target amount is required"),
    imageUrl: baseValidationRules.imageUrl,
    startDate: Yup.date()
      .min(new Date(), "Start date cannot be in the past")
      .required("Start date is required"),
    endDate: Yup.date()
      .min(Yup.ref("startDate"), "End date must be after start date")
      .required("End date is required"),
    acceptedDonationTypes: Yup.array()
      .of(Yup.string().oneOf(Object.values(DonationType)))
      .min(1, "At least one donation type is required")
      .required("Donation types are required"),
    selectedCauses: Yup.array()
      .of(Yup.string())
      .min(1, "At least one cause must be selected")
      .required("Causes are required"),
    status: Yup.string()
      .oneOf(["draft", "active", "completed", "cancelled"], "Invalid status")
      .required("Status is required"),
  });
};

export const updateCampaignValidationSchema = () => {
  return Yup.object().shape({
    title: baseValidationRules.title,
    description: baseValidationRules.description,
    totalTargetAmount: Yup.number()
      .min(1, "Total target amount must be greater than 0")
      .required("Total target amount is required"),
    imageUrl: baseValidationRules.imageUrl,
    startDate: Yup.date()
      .required("Start date is required"),
    endDate: Yup.date()
      .min(Yup.ref("startDate"), "End date must be after start date")
      .required("End date is required"),
    acceptedDonationTypes: Yup.array()
      .of(Yup.string().oneOf(Object.values(DonationType)))
      .min(1, "At least one donation type is required")
      .required("Donation types are required"),
  });
};

// Profile validation schemas
export const donorProfileValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .required("Last name is required"),
  email: baseValidationRules.email,
  phoneNumber: baseValidationRules.phoneNumber,
  bio: Yup.string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
  website: baseValidationRules.website,
});

export const organizationProfileValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Organization name must be at least 3 characters")
    .max(100, "Organization name must be less than 100 characters")
    .required("Organization name is required"),
  description: baseValidationRules.description,
  email: baseValidationRules.email,
  phoneNumber: baseValidationRules.phoneNumber,
  website: baseValidationRules.website,
  address: Yup.object().shape({
    street: Yup.string().required("Street address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    zipCode: Yup.string()
      .matches(/^\d{5,6}$/, "Invalid zip code format")
      .required("Zip code is required"),
    country: Yup.string().required("Country is required"),
  }).optional(),
});

// Donation validation schema
export const donationValidationSchema = Yup.object().shape({
  type: Yup.string()
    .oneOf(Object.values(DonationType), "Invalid donation type")
    .required("Donation type is required"),
  amount: Yup.number()
    .when("type", {
      is: "MONEY",
      then: (schema) => schema
        .min(1, "Amount must be greater than 0")
        .required("Amount is required for money donations"),
      otherwise: (schema) => schema.optional(),
    }),
  quantity: Yup.number()
    .when("type", {
      is: (type: string) => type !== "MONEY",
      then: (schema) => schema
        .min(1, "Quantity must be greater than 0")
        .required("Quantity is required for item donations"),
      otherwise: (schema) => schema.optional(),
    }),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .required("Description is required"),
  contactPhone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .required("Contact phone is required"),
  contactEmail: baseValidationRules.email,
});

// Validation error helper
export const getValidationErrors = (error: any) => {
  const errors: { [key: string]: string } = {};
  
  if (error.inner) {
    error.inner.forEach((err: any) => {
      if (err.path) {
        errors[err.path] = err.message;
      }
    });
  }
  
  return errors;
};

// Form field validation helper
export const validateField = async (
  schema: Yup.ObjectSchema<any>,
  fieldName: string,
  value: any,
  allValues: any
) => {
  try {
    await schema.validateAt(fieldName, { ...allValues, [fieldName]: value });
    return null; // No error
  } catch (error: any) {
    return error.message;
  }
};
