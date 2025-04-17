import { mkdir } from 'fs/promises';

const FORMS_DIR = 'data/forms';

export async function load() {
    try {
        await mkdir(FORMS_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating forms directory:', error);
    }
    return {};
} 