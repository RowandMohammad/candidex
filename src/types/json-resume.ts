/**
 * JSON Resume v1.0.0 — Canonical internal data format for Candidex.
 * 
 * All CV mutations happen on this structured data, never on raw text.
 * Flow: Ingest → JSONResume → Mutate → Render (DOCX/PDF)
 * 
 * @see https://jsonresume.org/schema/
 */

export interface JSONResumeBasics {
    name: string;
    label?: string;
    email: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
        address?: string;
        postalCode?: string;
        city?: string;
        countryCode?: string;
        region?: string;
    };
    profiles?: Array<{
        network: string;
        username?: string;
        url?: string;
    }>;
}

export interface JSONResumeWork {
    name: string;
    position: string;
    url?: string;
    startDate: string;
    endDate?: string;
    summary?: string;
    highlights: string[];
}

export interface JSONResumeEducation {
    institution: string;
    url?: string;
    area: string;
    studyType: string;
    startDate?: string;
    endDate?: string;
    score?: string;
    courses?: string[];
}

export interface JSONResumeSkill {
    name: string;
    level?: string;
    keywords: string[];
}

export interface JSONResumeProject {
    name: string;
    description?: string;
    highlights?: string[];
    keywords?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    roles?: string[];
}

export interface JSONResumeCertification {
    name: string;
    date?: string;
    issuer?: string;
    url?: string;
}

export interface JSONResumeLanguage {
    language: string;
    fluency?: string;
}

export interface JSONResumeVolunteer {
    organization: string;
    position: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
}

export interface JSONResumeAward {
    title: string;
    date?: string;
    awarder?: string;
    summary?: string;
}

export interface JSONResumePublication {
    name: string;
    publisher?: string;
    releaseDate?: string;
    url?: string;
    summary?: string;
}

export interface JSONResumeReference {
    name: string;
    reference?: string;
}

export interface JSONResumeInterest {
    name: string;
    keywords?: string[];
}

export interface JSONResume {
    basics: JSONResumeBasics;
    work: JSONResumeWork[];
    education: JSONResumeEducation[];
    skills: JSONResumeSkill[];
    projects?: JSONResumeProject[];
    certifications?: JSONResumeCertification[];
    languages?: JSONResumeLanguage[];
    volunteer?: JSONResumeVolunteer[];
    awards?: JSONResumeAward[];
    publications?: JSONResumePublication[];
    references?: JSONResumeReference[];
    interests?: JSONResumeInterest[];
}
