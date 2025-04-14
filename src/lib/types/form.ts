export type FormFieldType = 'text' | 'checkbox' | 'select' | 'radio';

export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string; }[];
    value?: string | number | boolean;
}

export interface FormData {
    id?: string;
    title?: string;
    description?: string;
    fields?: FormField[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface FormModel {
    [key: string]: FormField;
}

export interface FormErrors {
    [key: string]: string;
}

export interface FormBuilderProps {
    formName?: string;
    templates?: string[];
}

export type GetFormFunction = (name: string) => Promise<{
    model: FormModel;
    initialData: FormData;
}>;

export interface FormProps {
    formName: string;
    data: FormData;
    model: FormModel;
    errors: FormErrors;
    hideControls?: string[];
    readOnlyControls?: string[];
    readOnly?: boolean;
}

export interface FormViewerProps {
    formName: string;
    templates: string[];
    getFormFunc: (name: string) => Promise<{
        model: FormModel;
        initialData: FormData;
    }>;
} 