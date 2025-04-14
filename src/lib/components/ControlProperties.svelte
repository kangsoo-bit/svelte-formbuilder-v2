<!-- ControlProperties.svelte -->
<script lang="ts">
	import type { FormField } from '$lib/types/form';
	import { fade } from 'svelte/transition';

	let { control, onUpdate, onClose } = $props<{
		control: FormField;
		onUpdate: (control: FormField) => void;
		onClose: () => void;
	}>();

	let editingControl = $state<FormField>({ ...control });
	let newOption = $state('');

	function handleLabelChange(event: Event) {
		const target = event.target as HTMLInputElement;
		editingControl = {
			...editingControl,
			label: target.value
		};
	}

	function handleAddOption() {
		if (!newOption.trim()) return;
		
		editingControl = {
			...editingControl,
			options: [...(editingControl.options || []), newOption.trim()]
		};
		newOption = '';
	}

	function handleRemoveOption(index: number) {
		editingControl = {
			...editingControl,
			options: editingControl.options?.filter((_, i) => i !== index)
		};
	}

	function handleSave() {
		onUpdate(editingControl);
	}
</script>

<div class="properties-panel" transition:fade>
	<div class="panel-header">
		<h3>속성 편집</h3>
		<button class="close-button" onclick={onClose}>×</button>
	</div>

	<div class="panel-content">
		<div class="form-group">
			<label for="label">라벨</label>
			<input
				type="text"
				id="label"
				value={editingControl.label}
				onchange={handleLabelChange}
				placeholder="라벨을 입력하세요"
			/>
		</div>

		{#if ['select', 'radio', 'checkbox'].includes(editingControl.type)}
			<div class="form-group">
				<label>옵션</label>
				<div class="options-list">
					{#each editingControl.options || [] as option, i (i)}
						<div class="option-item">
							<span>{option}</span>
							<button
								class="remove-option"
								onclick={() => handleRemoveOption(i)}
								type="button"
							>
								×
							</button>
						</div>
					{/each}
				</div>

				<div class="add-option">
					<input
						type="text"
						bind:value={newOption}
						placeholder="새 옵션 추가"
						onkeydown={(e) => e.key === 'Enter' && handleAddOption()}
					/>
					<button onclick={handleAddOption} type="button">추가</button>
				</div>
			</div>
		{/if}

		<div class="button-group">
			<button class="save-button" onclick={handleSave}>저장</button>
			<button class="cancel-button" onclick={onClose}>취소</button>
		</div>
	</div>
</div>

<style>
	.properties-panel {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		width: 400px;
		max-width: 90vw;
		z-index: 1000;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #eee;
	}

	.panel-header h3 {
		margin: 0;
		font-size: 1.2rem;
		color: #333;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		color: #666;
	}

	.panel-content {
		padding: 1rem;
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