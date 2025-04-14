<!-- FormViewer.svelte -->
<script lang="ts">
    import type { Form, FormField } from '$lib/types';

    let { form } = $props<{ form: Form }>();
    let formData = $state<Record<string, any>>({});
    let errors = $state<Record<string, string>>({});

    function handleSubmit() {
        // 폼 데이터 검증 및 제출 로직
        console.log('Form data:', formData);
    }

    function handleChange(field: string, value: any) {
        formData = { ...formData, [field]: value };
    }
</script>

<div class="form-viewer p-6 bg-white rounded-lg shadow">
    <div class="mb-6">
        <h2 class="text-2xl font-bold mb-2">{form.title}</h2>
        {#if form.description}
            <p class="text-gray-600">{form.description}</p>
        {/if}
    </div>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        {#each Object.entries(form.model) as [fieldId, field]}
            {@const typedField = field as FormField}
            <div class="form-field"
                style="
                    width: {typedField.style?.width || '100%'};
                    height: {typedField.style?.height || 'auto'};
                    margin-top: {typedField.style?.marginTop || '0'};
                    margin-bottom: {typedField.style?.marginBottom || '0'};
                    margin-left: {typedField.style?.marginLeft || '0'};
                    margin-right: {typedField.style?.marginRight || '0'};
                "
            >
                <label class="block text-sm font-medium text-gray-700 mb-1" for={fieldId}>
                    {typedField.label}
                </label>

                {#if typedField.type === 'text' || typedField.type === 'number'}
                    <input
                        type={typedField.type}
                        id={fieldId}
                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData[fieldId] || ''}
                        on:input={(e) => handleChange(fieldId, e.currentTarget.value)}
                    />
                {:else if typedField.type === 'textarea'}
                    <textarea
                        id={fieldId}
                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData[fieldId] || ''}
                        on:input={(e) => handleChange(fieldId, e.currentTarget.value)}
                    ></textarea>
                {:else if typedField.type === 'select'}
                    <select
                        id={fieldId}
                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData[fieldId] || ''}
                        on:change={(e) => handleChange(fieldId, e.currentTarget.value)}
                    >
                        <option value="">선택하세요</option>
                        {#each typedField.options || [] as option}
                            <option value={option.value}>{option.label}</option>
                        {/each}
                    </select>
                {:else if typedField.type === 'checkbox'}
                    <label class="inline-flex items-center">
                        <input
                            type="checkbox"
                            id={fieldId}
                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={formData[fieldId] || false}
                            on:change={(e) => handleChange(fieldId, e.currentTarget.checked)}
                        />
                        <span class="ml-2">{typedField.label}</span>
                    </label>
                {:else if typedField.type === 'radio'}
                    <div class="space-y-2">
                        {#each typedField.options || [] as option}
                            <label class="inline-flex items-center">
                                <input
                                    type="radio"
                                    name={fieldId}
                                    class="border-gray-300 text-blue-600 focus:ring-blue-500"
                                    value={option.value}
                                    checked={formData[fieldId] === option.value}
                                    on:change={(e) => handleChange(fieldId, e.currentTarget.value)}
                                />
                                <span class="ml-2">{option.label}</span>
                            </label>
                        {/each}
                    </div>
                {/if}

                {#if errors[fieldId]}
                    <p class="mt-1 text-sm text-red-600">{errors[fieldId]}</p>
                {/if}
            </div>
        {/each}

        <div class="flex justify-end">
            <button
                type="submit"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                제출
            </button>
        </div>
    </form>
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