export interface Form {
    id: string;
    title: string;
    description: string;
    model: Record<string, FormField>;
    initialData: Record<string, any>;
}

export interface FormField {
    type: string;
    label: string;
    options?: Array<{
        value: string;
        label: string;
    }>;
    [key: string]: any;
} 