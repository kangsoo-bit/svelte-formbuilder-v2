import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { error } from '@sveltejs/kit';

const FORMS_DIR = 'data/forms';

export const GET: RequestHandler = async ({ params }) => {
    try {
        const filename = join(FORMS_DIR, `${params.id}.json`);
        const content = await readFile(filename, 'utf-8');
        return json(JSON.parse(content));
    } catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
            error(404, '폼을 찾을 수 없습니다.');
        }
        console.error('Error reading form:', err);
        error(500, '서버 에러가 발생했습니다.');
    }
};

export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const form = await request.json();
        
        // 폼 데이터 유효성 검증
        if (!form || typeof form !== 'object') {
            error(400, '잘못된 폼 데이터입니다.');
        }
        
        if (!form.id || form.id !== params.id) {
            error(400, '폼 ID가 일치하지 않습니다.');
        }

        const filename = join(FORMS_DIR, `${params.id}.json`);
        await writeFile(filename, JSON.stringify(form, null, 2));
        return json(form);
    } catch (err) {
        console.error('Error updating form:', err);
        error(500, '서버 에러가 발생했습니다.');
    }
};

export const DELETE: RequestHandler = async ({ params }) => {
    try {
        const filename = join(FORMS_DIR, `${params.id}.json`);
        await unlink(filename);
        return new Response(null, { status: 204 });
    } catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
            error(404, '폼을 찾을 수 없습니다.');
        }
        console.error('Error deleting form:', err);
        error(500, '서버 에러가 발생했습니다.');
    }
}; 