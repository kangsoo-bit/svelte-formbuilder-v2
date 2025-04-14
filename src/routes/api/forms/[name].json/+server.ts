import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { FormModel } from '$lib/types';

export const GET: RequestHandler = async ({ params }) => {
    const { name } = params;

    // 실제 구현에서는 데이터베이스에서 폼 데이터를 가져옵니다
    const formData = {
        model: {
            name: {
                type: 'text',
                label: '이름'
            },
            email: {
                type: 'text',
                label: '이메일'
            },
            subscribe: {
                type: 'checkbox',
                label: '뉴스레터 구독'
            },
            preference: {
                type: 'select',
                label: '선호도',
                options: [
                    { value: 'low', label: '낮음' },
                    { value: 'medium', label: '중간' },
                    { value: 'high', label: '높음' }
                ]
            }
        } as FormModel,
        initialData: {
            name: '',
            email: '',
            subscribe: false,
            preference: 'medium'
        }
    };
    
    return json(formData);
}; 