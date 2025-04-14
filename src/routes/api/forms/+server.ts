import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    // 실제 구현에서는 데이터베이스에서 폼 목록을 가져옵니다
    const forms = ['contactform', 'toolbarbuttons'];
    
    return json(forms);
}; 