import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const FORMS_DIR = 'data/forms';

export const GET: RequestHandler = async () => {
    try {
        // 폼 디렉토리가 없으면 생성
        try {
            await readdir(FORMS_DIR);
        } catch {
            return json([]);
        }

        // 모든 폼 파일 읽기
        const files = await readdir(FORMS_DIR);
        const forms = await Promise.all(
            files
                .filter(file => file.endsWith('.json'))
                .map(async file => {
                    const content = await readFile(join(FORMS_DIR, file), 'utf-8');
                    return JSON.parse(content);
                })
        );

        return json(forms);
    } catch (error) {
        console.error('Error reading forms:', error);
        return new Response('서버 에러가 발생했습니다.', { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const form = await request.json();

        // 폼 디렉토리가 없으면 생성
        try {
            await readdir(FORMS_DIR);
        } catch {
            await mkdir(FORMS_DIR, { recursive: true });
        }

        // 폼 저장
        const filename = join(FORMS_DIR, `${form.id}.json`);
        await writeFile(filename, JSON.stringify(form, null, 2));

        return json(form);
    } catch (error) {
        console.error('Error saving form:', error);
        return new Response('서버 에러가 발생했습니다.', { status: 500 });
    }
}; 