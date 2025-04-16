import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';

const FORMS_DIR = 'data/forms';

export const GET: RequestHandler = async ({ params }) => {
    try {
        const filename = join(FORMS_DIR, `${params.id}.json`);
        const content = await readFile(filename, 'utf-8');
        return json(JSON.parse(content));
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
            return new Response('폼을 찾을 수 없습니다.', { status: 404 });
        }
        console.error('Error reading form:', error);
        return new Response('서버 에러가 발생했습니다.', { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const form = await request.json();
        const filename = join(FORMS_DIR, `${params.id}.json`);
        await writeFile(filename, JSON.stringify(form, null, 2));
        return json(form);
    } catch (error) {
        console.error('Error updating form:', error);
        return new Response('서버 에러가 발생했습니다.', { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ params }) => {
    try {
        const filename = join(FORMS_DIR, `${params.id}.json`);
        await unlink(filename);
        return new Response(null, { status: 204 });
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
            return new Response('폼을 찾을 수 없습니다.', { status: 404 });
        }
        console.error('Error deleting form:', error);
        return new Response('서버 에러가 발생했습니다.', { status: 500 });
    }
}; 