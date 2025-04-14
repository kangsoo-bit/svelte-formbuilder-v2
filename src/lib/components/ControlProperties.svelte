<!-- ControlProperties.svelte -->
<script lang="ts">
	import type { FormField } from '$lib/types';

	let { control = $bindable(), onUpdate, onClose } = $props<{
		control: FormField;
		onUpdate: (control: FormField) => void;
		onClose: () => void;
	}>();

	let editingControl = $state<FormField>({ ...control });

	function handleUpdate() {
		onUpdate(editingControl);
	}

	function addOption() {
		if (!editingControl.options) {
			editingControl.options = [];
		}
		editingControl.options = [
			...editingControl.options,
			{ value: `option${editingControl.options.length + 1}`, label: `옵션 ${editingControl.options.length + 1}` }
		];
	}

	function removeOption(index: number) {
		if (!editingControl.options) return;
		editingControl.options = editingControl.options.filter((_, i) => i !== index);
	}

	function updateOption(index: number, field: 'value' | 'label', value: string) {
		if (!editingControl.options) return;
		editingControl.options = editingControl.options.map((option, i) =>
			i === index ? { ...option, [field]: value } : option
		);
	}
</script>

<div class="properties-editor">
	<div class="header flex justify-between items-center mb-6">
		<h3 class="text-lg font-semibold">속성 편집</h3>
		<button
			class="text-gray-500 hover:text-gray-700"
			onclick={onClose}
		>
			✕
		</button>
	</div>

	<div class="form-group mb-4">
		<label class="block text-sm font-medium text-gray-700 mb-1">
			라벨
		</label>
		<input
			type="text"
			class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			bind:value={editingControl.label}
		/>
	</div>

	{#if editingControl.type === 'select' || editingControl.type === 'radio'}
		<div class="form-group mb-4">
			<label class="block text-sm font-medium text-gray-700 mb-1">
				옵션
			</label>
			<div class="space-y-2">
				{#each editingControl.options || [] as option, index}
					<div class="flex gap-2">
						<input
							type="text"
							class="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="값"
							value={option.value}
							oninput={(e) => updateOption(index, 'value', e.currentTarget.value)}
						/>
						<input
							type="text"
							class="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="라벨"
							value={option.label}
							oninput={(e) => updateOption(index, 'label', e.currentTarget.value)}
						/>
						<button
							class="text-red-500 hover:text-red-700 px-2"
							onclick={() => removeOption(index)}
						>
							✕
						</button>
					</div>
				{/each}
				<button
					class="w-full p-2 border border-dashed rounded hover:bg-gray-50 text-gray-600"
					onclick={addOption}
				>
					+ 옵션 추가
				</button>
			</div>
		</div>
	{/if}

	<div class="flex justify-end space-x-2 mt-6">
		<button
			class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
			onclick={onClose}
		>
			취소
		</button>
		<button
			class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			onclick={handleUpdate}
		>
			저장
		</button>
	</div>
</div>

<style>
	.properties-editor {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.header h3 {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 600;
		color: #666;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #666;
	}

	input[type="text"] {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	.options-list {
		margin-bottom: 1rem;
	}

	.option-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: #f5f5f5;
		border-radius: 4px;
		margin-bottom: 0.5rem;
	}

	.remove-option {
		background: none;
		border: none;
		color: #ff4444;
		cursor: pointer;
		padding: 0 0.5rem;
	}

	.add-option {
		display: flex;
		gap: 0.5rem;
	}

	.add-option input {
		flex: 1;
	}

	.add-option button {
		padding: 0.5rem 1rem;
		background: #4CAF50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.button-group {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.save-button,
	.cancel-button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.save-button {
		background: #2196F3;
		color: white;
	}

	.cancel-button {
		background: #f5f5f5;
		color: #333;
	}

	button:hover {
		opacity: 0.9;
	}
</style> 