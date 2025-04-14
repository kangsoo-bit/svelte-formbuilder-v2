<!-- ControlProperties.svelte -->
<script lang="ts">
	import type { FormField } from '$lib/types';

	let { control, onUpdate } = $props();
	let editingControl = { ...control };

	function updateControl() {
		onUpdate(editingControl);
	}

	function updateStyle(property: string, value: string) {
		editingControl.style = {
			...editingControl.style,
			[property]: value
		};
		updateControl();
	}

	function updatePosition(property: 'x' | 'y' | 'zIndex', value: number) {
		editingControl.position = {
			...editingControl.position,
			[property]: value
		};
		updateControl();
	}

	function addOption() {
		const options = [...(editingControl.options || [])];
		options.push({ value: '', label: '' });
		editingControl.options = options;
		updateControl();
	}

	function removeOption(index: number) {
		const options = [...(editingControl.options || [])];
		options.splice(index, 1);
		editingControl.options = options;
		updateControl();
	}

	function updateOptionValue(index: number, value: string) {
		const options = [...(editingControl.options || [])];
		options[index] = { ...options[index], value };
		editingControl.options = options;
		updateControl();
	}

	function updateOptionLabel(index: number, label: string) {
		const options = [...(editingControl.options || [])];
		options[index] = { ...options[index], label };
		editingControl.options = options;
		updateControl();
	}
</script>

<div class="properties-editor">
	<h3>속성 편집</h3>
	
	<div class="property-group">
		<label>
			라벨
			<input 
				type="text" 
				value={editingControl.label} 
				oninput={(e) => {
					editingControl.label = e.currentTarget.value;
					updateControl();
				}}
			/>
		</label>
	</div>

	<div class="property-group">
		<h4>크기</h4>
		<label>
			너비
			<input 
				type="text" 
				value={editingControl.style?.width || 'auto'} 
				oninput={(e) => updateStyle('width', e.currentTarget.value)}
			/>
		</label>
		<label>
			높이
			<input 
				type="text" 
				value={editingControl.style?.height || 'auto'} 
				oninput={(e) => updateStyle('height', e.currentTarget.value)}
			/>
		</label>
	</div>

	<div class="property-group">
		<h4>위치</h4>
		<label>
			X 좌표
			<input 
				type="number" 
				value={editingControl.position?.x || 0} 
				oninput={(e) => updatePosition('x', +e.currentTarget.value)}
			/>
		</label>
		<label>
			Y 좌표
			<input 
				type="number" 
				value={editingControl.position?.y || 0} 
				oninput={(e) => updatePosition('y', +e.currentTarget.value)}
			/>
		</label>
		<label>
			Z-Index
			<input 
				type="number" 
				value={editingControl.position?.zIndex || 1} 
				oninput={(e) => updatePosition('zIndex', +e.currentTarget.value)}
			/>
		</label>
	</div>

	{#if editingControl.type === 'select' || editingControl.type === 'radio'}
		<div class="property-group">
			<h4>옵션</h4>
			<button onclick={addOption} class="add-option">+ 옵션 추가</button>
			
			{#each editingControl.options || [] as option, i}
				<div class="option-row">
					<input 
						type="text" 
						placeholder="값" 
						value={option.value}
						oninput={(e) => updateOptionValue(i, e.currentTarget.value)}
					/>
					<input 
						type="text" 
						placeholder="라벨" 
						value={option.label}
						oninput={(e) => updateOptionLabel(i, e.currentTarget.value)}
					/>
					<button onclick={() => removeOption(i)} class="remove-option">×</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.properties-editor {
		height: 100%;
		background: white;
		font-size: 0.875rem;
	}

	h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	h4 {
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #4b5563;
	}

	.property-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #374151;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		margin-top: 0.25rem;
	}

	input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 2px rgba(37,99,235,0.1);
	}

	.option-row {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.add-option {
		width: 100%;
		padding: 0.5rem;
		background: #f3f4f6;
		border: 1px dashed #9ca3af;
		border-radius: 0.25rem;
		color: #4b5563;
		margin-bottom: 1rem;
		cursor: pointer;
	}

	.add-option:hover {
		background: #e5e7eb;
	}

	.remove-option {
		padding: 0 0.5rem;
		background: #fee2e2;
		border: none;
		border-radius: 0.25rem;
		color: #dc2626;
		cursor: pointer;
	}

	.remove-option:hover {
		background: #fecaca;
	}
</style> 