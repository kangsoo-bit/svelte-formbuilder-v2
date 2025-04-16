<!-- ControlProperties.svelte -->
<script lang="ts">
	import type { FormField } from '$lib/types';

	let { control, onUpdate, onclose } = $props();
	
	let editingControl = $state<FormField>({
		...control,
		position: {
			x: Number(control.position?.x || 0),
			y: Number(control.position?.y || 0),
			zIndex: Number(control.position?.zIndex || 1)
		},
		style: {
			...control.style
		},
		options: control.options ? [...control.options] : undefined
	});

	// control prop이 변경될 때마다 editingControl 업데이트
	$effect(() => {
		editingControl = {
			...control,
			position: {
				x: Number(control.position?.x || 0),
				y: Number(control.position?.y || 0),
				zIndex: Number(control.position?.zIndex || 1)
			},
			style: {
				...control.style
			},
			options: control.options ? [...control.options] : undefined
		};
	});

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
			x: editingControl.position?.x || 0,
			y: editingControl.position?.y || 0,
			zIndex: editingControl.position?.zIndex || 1,
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
	<div class="header">
		<h3>속성 편집</h3>
		<button class="close-button" onclick={onclose}>×</button>
	</div>
	
	<div class="property-group">
		<label>
			라벨
			<input 
				type="text" 
				bind:value={editingControl.label}
				oninput={updateControl}
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
		position: relative;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #6b7280;
		cursor: pointer;
		padding: 0.25rem;
	}

	.close-button:hover {
		color: #374151;
	}

	h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
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
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		margin-top: 0.25rem;
	}

	input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
	}

	.option-row {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.add-option {
		background: #2563eb;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		cursor: pointer;
		margin-bottom: 1rem;
	}

	.add-option:hover {
		background: #1d4ed8;
	}

	.remove-option {
		background: none;
		border: none;
		color: #ef4444;
		cursor: pointer;
		font-size: 1.25rem;
		padding: 0 0.5rem;
	}

	.remove-option:hover {
		color: #dc2626;
	}
</style> 