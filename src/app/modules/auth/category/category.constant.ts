export enum MainCategory {
    ACADEMIC = "Academic",
    ADMISSION = "Admission",
    JOB = "Job"
}

export enum AcademicSubCategory {
    SCIENCE = "Science",
    COMMERCE = "Commerce",
    ARTS = "Arts"
}

export enum AdmissionSubCategory {
    ENGINEERING = "Engineering",
    MEDICAL = "Medical",
    UNIVERSITY = "University"
}

// Explicitly type as string[]
export const mainCategories: string[] = Object.values(MainCategory);

// Add return type annotation
export const getValidSubCategories = (mainCategory: string): string[] => {
    switch (mainCategory) {
        case MainCategory.ACADEMIC:
            return Object.values(AcademicSubCategory);
        case MainCategory.ADMISSION:
            return Object.values(AdmissionSubCategory);
        case MainCategory.JOB:
            return [];
        default:
            return [];
    }
};

// To maintain backward compatibility for a while
export const categoryType: string[] = Object.values(MainCategory);