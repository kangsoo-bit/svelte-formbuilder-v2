<!--
@component
메인 페이지 - 저장된 폼 목록을 보여주고 새 폼을 생성할 수 있습니다.
-->
<script lang="ts">
    import type { Form } from '$lib/types';

    let forms = $state<Form[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);

    // 폼 목록 불러오기
    async function loadForms() {
        try {
            loading = true;
            const response = await fetch('/api/forms');
            if (!response.ok) throw new Error('폼 목록을 불러오는데 실패했습니다');
            forms = await response.json();
        } catch (err) {
            error = err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다';
        } finally {
            loading = false;
        }
    }

    // 폼 삭제
    async function deleteForm(id: string) {
        if (!confirm('정말 이 폼을 삭제하시겠습니까?')) return;
        
        try {
            const response = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('폼 삭제에 실패했습니다');
            await loadForms(); // 목록 새로고침
        } catch (err) {
            error = err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다';
        }
    }

    // 컴포넌트 마운트시 폼 목록 로드
    $effect(() => {
        loadForms();
    });
</script>

<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">폼 목록</h1>
        <a href="/forms/new" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            새 폼 만들기
        </a>
    </div>

    {#if loading}
        <div class="text-center py-8">
            <span class="text-gray-600">로딩 중...</span>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
        </div>
    {:else if forms.length === 0}
        <div class="text-center py-8">
            <p class="text-gray-600">저장된 폼이 없습니다.</p>
            <a href="/forms/new" class="text-blue-500 hover:underline mt-2 inline-block">
                첫 번째 폼을 만들어보세요!
            </a>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each forms as form}
                <div class="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h2 class="text-xl font-semibold mb-2">{form.title || '제목 없음'}</h2>
                    <p class="text-gray-600 mb-4">{form.description || '설명 없음'}</p>
                    <div class="flex justify-end space-x-2">
                        <a href="/forms/{form.id}" class="text-blue-500 hover:underline">
                            편집
                        </a>
                        <button 
                            class="text-red-500 hover:underline"
                            onclick={() => form.id && deleteForm(form.id)}
                        >
                            삭제
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .tabs button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background-color: #f5f5f5;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .tabs button:hover {
        background-color: #e0e0e0;
    }

    .tabs button.active {
        background-color: #007bff;
        color: white;
    }

    .content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
</style>
