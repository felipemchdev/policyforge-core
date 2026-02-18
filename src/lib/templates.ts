export type TemplateId =
  | "scholarship_basic"
  | "scholarship_stem"
  | "bootcamp_admissions"
  | "course_discount"
  | "internship_program"
  | "exchange_program"
  | "microgrant"
  | "tuition_aid"
  | "housing_aid"
  | "research_fellowship";

export type PolicyPackId = "education_core_pack" | "financial_aid_pack" | "mobility_research_pack";

export type TemplateSection = "applicant" | "application" | "options";

export type TemplateFieldType = "text" | "number" | "boolean" | "select" | "date" | "textarea";

export interface TemplateFieldOption {
  label: string;
  value: string;
}

export interface TemplateField {
  section: TemplateSection;
  key: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  helperText?: string;
  options?: TemplateFieldOption[];
}

export interface TemplatePayload {
  applicant: Record<string, unknown>;
  application: Record<string, unknown>;
  options: Record<string, unknown>;
}

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  description: string;
  selectedPolicyPack: PolicyPackId;
  defaultPayload: TemplatePayload;
  fields: TemplateField[];
}

const SHARED_FIELDS: TemplateField[] = [
  {
    section: "applicant",
    key: "full_name",
    label: "Full name",
    type: "text",
    required: true,
  },
  {
    section: "applicant",
    key: "email",
    label: "Email",
    type: "text",
    required: true,
  },
  {
    section: "applicant",
    key: "country",
    label: "Country",
    type: "text",
    required: true,
  },
  {
    section: "applicant",
    key: "age",
    label: "Age",
    type: "number",
    required: true,
  },
  {
    section: "applicant",
    key: "gpa",
    label: "GPA (0-4)",
    type: "number",
    required: true,
  },
  {
    section: "applicant",
    key: "household_income",
    label: "Annual household income (USD)",
    type: "number",
    required: true,
  },
  {
    section: "application",
    key: "program_name",
    label: "Program name",
    type: "text",
    required: true,
  },
  {
    section: "application",
    key: "requested_amount",
    label: "Requested amount (USD)",
    type: "number",
    required: true,
  },
  {
    section: "application",
    key: "start_date",
    label: "Start date",
    type: "date",
    required: true,
  },
  {
    section: "application",
    key: "enrollment_status",
    label: "Enrollment status",
    type: "select",
    required: true,
    options: [
      { label: "Full-time", value: "full_time" },
      { label: "Part-time", value: "part_time" },
      { label: "Not enrolled", value: "not_enrolled" },
    ],
  },
  {
    section: "application",
    key: "motivation",
    label: "Motivation",
    type: "textarea",
    required: true,
  },
  {
    section: "options",
    key: "consent_data_processing",
    label: "Consent for data processing",
    type: "boolean",
    required: true,
  },
  {
    section: "options",
    key: "urgent_review",
    label: "Urgent review",
    type: "boolean",
    required: false,
  },
];

function buildTemplate(
  id: TemplateId,
  label: string,
  description: string,
  selectedPolicyPack: PolicyPackId,
  payload: TemplatePayload,
): TemplateDefinition {
  return {
    id,
    label,
    description,
    selectedPolicyPack,
    defaultPayload: payload,
    fields: SHARED_FIELDS,
  };
}

export const TEMPLATES: TemplateDefinition[] = [
  buildTemplate(
    "scholarship_basic",
    "Scholarship Basic",
    "General scholarship screening with income and merit signals.",
    "education_core_pack",
    {
      applicant: {
        full_name: "Alex Rivera",
        email: "alex.rivera@example.com",
        country: "Brazil",
        age: 21,
        gpa: 3.6,
        household_income: 22000,
      },
      application: {
        program_name: "Undergraduate Scholarship",
        requested_amount: 8000,
        start_date: "2026-09-01",
        enrollment_status: "full_time",
        motivation: "I need support to continue my degree and keep full-time dedication.",
      },
      options: {
        consent_data_processing: true,
        urgent_review: false,
      },
    },
  ),
  buildTemplate(
    "scholarship_stem",
    "Scholarship STEM",
    "Scholarship flow focused on STEM applicants and performance criteria.",
    "education_core_pack",
    {
      applicant: {
        full_name: "Sam Carter",
        email: "sam.carter@example.com",
        country: "Portugal",
        age: 20,
        gpa: 3.9,
        household_income: 18000,
      },
      application: {
        program_name: "STEM Excellence Scholarship",
        requested_amount: 12000,
        start_date: "2026-10-15",
        enrollment_status: "full_time",
        motivation: "I am applying to support tuition and lab expenses in engineering.",
      },
      options: {
        consent_data_processing: true,
        urgent_review: true,
      },
    },
  ),
  buildTemplate(
    "bootcamp_admissions",
    "Bootcamp Admissions",
    "Admission and aid decision for professional bootcamp candidates.",
    "education_core_pack",
    {
      applicant: {
        full_name: "Taylor Morgan",
        email: "taylor.morgan@example.com",
        country: "Mexico",
        age: 27,
        gpa: 3.2,
        household_income: 28000,
      },
      application: {
        program_name: "Data Engineering Bootcamp",
        requested_amount: 3500,
        start_date: "2026-07-06",
        enrollment_status: "part_time",
        motivation: "I want to transition into data engineering and need tuition support.",
      },
      options: {
        consent_data_processing: true,
        urgent_review: false,
      },
    },
  ),
  buildTemplate(
    "course_discount",
    "Course Discount",
    "Course-level discount decision based on affordability and profile fit.",
    "financial_aid_pack",
    {
      applicant: {
        full_name: "Jordan Lee",
        email: "jordan.lee@example.com",
        country: "Chile",
        age: 24,
        gpa: 3.4,
        household_income: 30000,
      },
      application: {
        program_name: "Cloud Security Course",
        requested_amount: 900,
        start_date: "2026-05-20",
        enrollment_status: "part_time",
        motivation: "A discount would make this upskilling program financially viable.",
      },
      options: {
        consent_data_processing: true,
        urgent_review: false,
      },
    },
  ),
  buildTemplate(
    "internship_program",
    "Internship Program",
    "Eligibility review for stipend-backed internship placements.",
    "education_core_pack",
    {
      applicant: {
        full_name: "Chris Novak",
        email: "chris.novak@example.com",
        country: "Spain",
        age: 22,
        gpa: 3.5,
        household_income: 25000,
      },
      application: {
        program_name: "Public Policy Internship",
        requested_amount: 2500,
        start_date: "2026-06-01",
        enrollment_status: "full_time",
        motivation: "I need stipend support to accept an internship in another city.",
      },
      options: {
        consent_data_processing: true,
        urgent_review: false,
      },
    },
  ),
  buildTemplate(
    "exchange_program",
    "Exchange Program",
    "Cross-border exchange aid review with mobility policy checks.",
    "mobility_research_pack",
    {
      applicant: {
        full_name: "Morgan Silva",
        email: "morgan.silva@example.com",
        country: "Brazil",
        age: 23,
        gpa: 3.7,
        household_income: 21000,
      },
      application: {
        program_name: "International Exchange Semester",
        requested_amount: 7000,
        start_date: "2026-08-15",
        enrollment_status: "full_time",
        motivation: "Exchange participation is possible only if travel and housing are supported.",
      },
      options: {
        consent_data_processing: true,
        urgent_review: true,
      },
    },
  ),
  buildTemplate(
    "microgrant",
    "Microgrant",
    "Fast microgrant decision for short educational initiatives.",
    "financial_aid_pack",
    {
      applicant: {
        full_name: "Avery Kim",
        email: "avery.kim@example.com",
        country: "Argentina",
        age: 29,
        gpa: 3.1,
        household_income: 19000,
      },
      application: {
        program_name: "Community Learning Microgrant",
        requested_amount: 1200,
        start_date: "2026-04-12",
        enrollment_status: "not_enrolled",
        motivation: "The grant funds materials for a local digital literacy cohort.",
      },
      options: {
        consent_data_processing: true,
        urgent_review: true,
      },
    },
  ),
  buildTemplate(
    "tuition_aid",
    "Tuition Aid",
    "Tuition support decision with affordability and continuity constraints.",
    "financial_aid_pack",
    {
      applicant: {
        full_name: "Pat Quinn",
        email: "pat.quinn@example.com",
        country: "Colombia",
        age: 19,
        gpa: 3.8,
        household_income: 16000,
      },
      application: {
        program_name: "Bachelor Tuition Aid",
        requested_amount: 10000,
        start_date: "2026-09-10",
        enrollment_status: "full_time",
        motivation: "This aid is required to keep enrollment and avoid interruption.",
      },
      options: {
        consent_data_processing: true,
        urgent_review: false,
      },
    },
  ),
  buildTemplate(
    "housing_aid",
    "Housing Aid",
    "Housing subsidy decision tied to education attendance conditions.",
    "financial_aid_pack",
    {
      applicant: {
        full_name: "Riley Park",
        email: "riley.park@example.com",
        country: "Peru",
        age: 25,
        gpa: 3.3,
        household_income: 17000,
      },
      application: {
        program_name: "Student Housing Aid",
        requested_amount: 4200,
        start_date: "2026-08-01",
        enrollment_status: "part_time",
        motivation: "Housing aid reduces commute barriers and keeps program attendance stable.",
      },
      options: {
        consent_data_processing: true,
        urgent_review: false,
      },
    },
  ),
  buildTemplate(
    "research_fellowship",
    "Research Fellowship",
    "Research fellowship selection with mobility and merit dimensions.",
    "mobility_research_pack",
    {
      applicant: {
        full_name: "Jamie Alvarez",
        email: "jamie.alvarez@example.com",
        country: "Uruguay",
        age: 26,
        gpa: 3.95,
        household_income: 23000,
      },
      application: {
        program_name: "Public Policy Research Fellowship",
        requested_amount: 15000,
        start_date: "2026-11-01",
        enrollment_status: "full_time",
        motivation: "The fellowship supports full research dedication and publication goals.",
      },
      options: {
        consent_data_processing: true,
        urgent_review: true,
      },
    },
  ),
];

export const TEMPLATE_BY_ID = Object.fromEntries(
  TEMPLATES.map((template) => [template.id, template]),
) as Record<TemplateId, TemplateDefinition>;
