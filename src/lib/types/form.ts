export type FormFieldType = 'text' | 'number' | 'email' | 'password' | 'select' | 'radio' | 'checkbox' | 'textarea';

export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
    value?: string | number | boolean | string[];
}

export interface FormData {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
    createdAt: Date;
    updatedAt: Date;
} 