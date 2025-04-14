export interface Form {
    id?: string;
    title: string;
    description?: string;
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
    style?: {
        width?: string;
        height?: string;
        marginTop?: string;
        marginBottom?: string;
        marginLeft?: string;
        marginRight?: string;
    };
    position?: {
        x: number;
        y: number;
        zIndex: number;
    };
    [key: string]: any;
} 