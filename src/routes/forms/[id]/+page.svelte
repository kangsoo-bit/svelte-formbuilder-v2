<!--
@component
폼 편집 페이지 - 새 폼을 만들거나 기존 폼을 편집할 수 있습니다.
-->
<script lang="ts">
    import { page } from '$app/stores';
    import FormBuilder from '$lib/components/FormBuilder.svelte';
    import FormViewer from '$lib/components/FormViewer.svelte';
    import type { Form } from '$lib/types';
    import { onMount } from 'svelte';
    
    let form = $state<Form | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let activeTab = $state<'builder' | 'viewer'>('builder');
    let retryCount = $state(0);
    const MAX_RETRIES = 3;
    
    // 폼 데이터 로드
    async function loadForm(id: string) {
        try {
            loading = true;
            error = null;
            const response = await fetch(`/api/forms/${id}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    // 새 폼 생성
                    form = {
                        id,
                        title: '새 폼',
                        description: '',
                        model: {},
                        initialData: {}
                    };
                    return;
                }
                
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || '폼을 불러오는데 실패했습니다');
            }
            
            form = await response.json();
            retryCount = 0; // 성공시 재시도 카운트 리셋
        } catch (err) {
            error = err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다';
            
            // 자동 재시도 로직
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                setTimeout(() => {
                    loadForm(id);
                }, 1000 * retryCount); // 점진적으로 재시도 간격 증가
            }
        } finally {
            loading = false;
        }
    }

    // 폼 저장
    async function saveForm() {
        if (!form) return;
        
        try {
            error = null;
            const response = await fetch(`/api/forms/${form.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || '폼 저장에 실패했습니다');
            }
            
            form = await response.json();
        } catch (err) {
            error = err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다';
        }
    }

    // 페이지 로드시 폼 데이터 불러오기
    $effect(() => {
        const id = $page.params.id;
        if (id) loadForm(id);
    });
</script>

<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">
            {form?.title || '새 폼'}
        </h1>
        <div class="flex space-x-4">
            <button
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onclick={saveForm}
                disabled={loading}
            >
                {loading ? '저장 중...' : '저장'}
            </button>
            <a
                href="/"
                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
                목록으로
            </a>
        </div>
    </div>

    {#if loading}
        <div class="text-center py-8">
            <span class="text-gray-600">로딩 중{#if retryCount > 0}... (재시도 {retryCount}/{MAX_RETRIES}){/if}</span>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong class="font-bold">에러 발생!</strong>
            <span class="block sm:inline">{error}</span>
            {#if retryCount < MAX_RETRIES}
                <p class="mt-2">자동으로 재시도 중입니다...</p>
            {:else}
                <button
                    class="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    onclick={() => {
                        retryCount = 0;
                        loadForm($page.params.id);
                    }}
                >
                    다시 시도
                </button>
            {/if}
        </div>
    {:else}
        <div class="mb-8">
            <div class="flex space-x-4 mb-4">
                <button
                    class="px-4 py-2 rounded {activeTab === 'builder' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
                    onclick={() => activeTab = 'builder'}
                >
                    폼 빌더
                </button>
                <button
                    class="px-4 py-2 rounded {activeTab === 'viewer' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
                    onclick={() => activeTab = 'viewer'}
                >
                    미리보기
                </button>
            </div>

            {#if activeTab === 'builder' && form}
                <FormBuilder bind:form />
            {:else if form}
                <FormViewer {form} />
            {/if}
        </div>
    {/if}
</div> 