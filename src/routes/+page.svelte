<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<script lang="ts">
    import FormBuilder from '$lib/components/FormBuilder.svelte';
    import FormViewer from '$lib/components/FormViewer.svelte';
    import type { GetFormFunction } from '$lib/types';

    let activeTab = $state<'builder' | 'viewer'>('builder');
    let formName = $state('');
    let templates = $state<string[]>(['contactform', 'toolbarbuttons']);

    const getForm: GetFormFunction = async (name: string) => {
        // 실제 구현에서는 API 호출로 대체
        return {
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
            },
            initialData: {
                name: '',
                email: '',
                subscribe: false,
                preference: 'medium'
            }
        };
    };
</script>

<div class="container">
    <div class="tabs">
        <button
            class:active={activeTab === 'builder'}
            onclick={() => activeTab = 'builder'}
        >
            폼 빌더
        </button>
        <button
            class:active={activeTab === 'viewer'}
            onclick={() => activeTab = 'viewer'}
        >
            폼 미리보기
        </button>
    </div>

    <div class="content">
        {#if activeTab === 'builder'}
            <FormBuilder {formName} {templates} />
        {:else}
            <FormViewer {formName} {templates} getFormFunc={getForm} />
        {/if}
    </div>
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
