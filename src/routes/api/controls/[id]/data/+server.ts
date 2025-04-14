import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const { id } = params;

    // 실제 구현에서는 데이터베이스에서 컨트롤의 추가 데이터를 가져옵니다
    const controlData = {
        id,
        type: 'text',
        validation: {
            required: true,
            minLength: 3,
            maxLength: 50
        },
        style: {
            width: '100%',
            height: '40px',
            fontSize: '16px'
        }
    };
    
    return json(controlData);
}; 