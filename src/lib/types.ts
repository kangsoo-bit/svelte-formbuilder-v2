// types.ts

export interface FormField {
    type: 'text' | 'checkbox' | 'select' | 'radio';
    label: string;
    options?: Array<{
        value: string;
        label: string;
    }>;
}

export interface FormModel {
    [key: string]: FormField;
}

export interface FormData {
    [key: string]: string | boolean | number;
}

export interface FormErrors {
    [key: string]: string;
}

export interface FormTemplate {
    name: string;
    model: FormModel;
    initialData: FormData;
}

export interface GetFormFunction {
    (name: string): Promise<{
        model: FormModel;
        initialData: FormData;
    }>;
}

export interface FormBuilderProps {
    formName: string;
    templates: string[];
}

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
    getFormFunc: GetFormFunction;
} 