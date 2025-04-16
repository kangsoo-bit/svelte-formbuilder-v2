<!-- Form.svelte -->
<script lang="ts">
    import type { FormModel, FormData, FormErrors, FormProps, FormField } from '$lib/types/form';

    let props = $props();
    let formName = $state(props.formName ?? '');
    let data = $state(props.data ?? {} as FormData);
    let model = $state(props.model ?? {} as FormModel);
    let errors = $state(props.errors ?? {} as FormErrors);
    let hideControls = $state(props.hideControls ?? []);
    let readOnlyControls = $state(props.readOnlyControls ?? []);
    let readOnly = $state(props.readOnly ?? false);

    let uploadUrl = $state('/api/upload');
    let downloadUrl = $state('/api/download');
    let autoCheckConditions = $state(true);
    let autoValidate = $state(true);

    function handleDataChange(form: null, { key, value }: { key: string; value: string | boolean }) {
        data = { ...data, [key]: value };
    }

    function handleEvent(args: unknown) {
        console.log('Form event:', args);
    }

    function validate() {
        // 폼 유효성 검사 로직
        return true;
    }

    function checkConditions() {
        // 조건 검사 로직
        return true;
    }

    $effect(() => {
        if (autoValidate) {
            validate();
        }
    });

    $effect(() => {
        if (autoCheckConditions) {
            checkConditions();
        }
    });
</script>

<div class="form" class:readonly={readOnly}>
    {#if formName}
        <h2>{formName}</h2>
    {/if}

    <div class="form-fields">
        {#each Object.entries(model) as [key, field]}
            {@const typedField = field as FormField}
            {#if !hideControls.includes(key)}
                <div class="form-field" class:readonly={readOnlyControls.includes(key)}>
                    <label for={key}>{typedField.label}</label>
                    {#if typedField.type === 'text'}
                        <input
                            type="text"
                            id={key}
                            value={data[key] || ''}
                            readonly={readOnlyControls.includes(key)}
                            oninput={(e) => handleDataChange(null, { key, value: (e.target as HTMLInputElement).value })}
                        />
                    {:else if typedField.type === 'checkbox'}
                        <input
                            type="checkbox"
                            id={key}
                            checked={!!data[key]}
                            readonly={readOnlyControls.includes(key)}
                            onchange={(e) => handleDataChange(null, { key, value: (e.target as HTMLInputElement).checked })}
                        />
                    {:else if typedField.type === 'select' && typedField.options}
                        <select
                            id={key}
                            value={data[key] || ''}
                            disabled={readOnlyControls.includes(key)}
                            onchange={(e) => handleDataChange(null, { key, value: (e.target as HTMLSelectElement).value })}
                        >
                            {#each typedField.options as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>
                    {/if}
                    {#if errors[key]}
                        <div class="error">{errors[key]}</div>
                    {/if}
                </div>
            {/if}
        {/each}
    </div>
</div>

<style>
    .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }

    .form.readonly {
        opacity: 0.8;
        pointer-events: none;
    }

    .form-fields {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-field.readonly {
        opacity: 0.8;
        pointer-events: none;
    }

    label {
        font-weight: bold;
    }

    input, select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .error {
        color: red;
        font-size: 0.875rem;
    }
</style> 