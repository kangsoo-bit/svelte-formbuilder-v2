<!-- FormViewer.svelte -->
<script lang="ts">
    import Form from './Form.svelte';
    import type { FormData, FormModel, FormErrors, FormViewerProps } from '$lib/types';

    let { 
        formName = '', 
        templates = [] as string[], 
        getFormFunc = undefined as GetFormFunction | undefined 
    } = $props<FormViewerProps>();
    
    let data = $state({} as FormData);
    let model = $state({} as FormModel);
    let errors = $state({} as FormErrors);

    async function loadForm() {
        if (!formName || !getFormFunc) return;

        try {
            const formData = await getFormFunc(formName);
            if (formData) {
                model = formData.model || {};
                data = formData.initialData || {};
            }
        } catch (error) {
            console.error('Error loading form:', error);
        }
    }

    $effect(() => {
        loadForm();
    });
</script>

<div class="form-viewer">
    <div class="viewer-header">
        <h2>폼 미리보기: {formName}</h2>
    </div>

    <div class="viewer-content">
        <Form
            {formName}
            {data}
            {model}
            {errors}
            readOnly={true}
        />
    </div>
</div>

<style>
    .form-viewer {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        background-color: #f9f9f9;
        border-radius: 4px;
    }

    .viewer-header {
        padding-bottom: 1rem;
        border-bottom: 1px solid #ddd;
    }

    .viewer-content {
        padding: 1rem;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
</style> 