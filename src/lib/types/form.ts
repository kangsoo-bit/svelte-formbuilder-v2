export type FormFieldType = 'text' | 'number' | 'checkbox' | 'select' | 'radio' | 'textarea';

export interface FormField {
    id: string;
    widgetId: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    options?: { value: string; label: string; }[];
    value?: string | number | boolean;
    position?: { x: number; y: number; zIndex: number };
    style?: {
        width?: string;
        height?: string;
        margin?: string;
        padding?: string;
        border?: string;
        borderRadius?: string;
        backgroundColor?: string;
        fontSize?: string;
        fontWeight?: string;
        color?: string;
        accentColor?: string;
    };
    initialDragPosition?: {
        x: number;
        y: number;
    };
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

export interface Form {
    id: string;
    title: string;
    description?: string;
    model: FormModel;
    widgetId: string;
    createdAt: Date;
    updatedAt: Date;
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

export interface FormBuilderState {
    editingControlId: string | null;
    isResizing: boolean;
    resizeDirection: string | null;
    initialSize: { width: number; height: number };
    initialPosition: { x: number; y: number };
} 