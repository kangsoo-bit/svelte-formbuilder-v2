<!-- FormBuilder.svelte -->
<script lang="ts">
	import type { Form, FormField } from '$lib/types';
	import ControlProperties from './ControlProperties.svelte';

	let { form = $bindable() } = $props();

	let editingControlId = $state<string | null>(null);
	let draggedControl = $state<string | null>(null);
	let dropTarget = $state<string | null>(null);

	// 컨트롤 타입 목록
	const controlTypes = [
		{ type: 'text', label: '텍스트' },
		{ type: 'number', label: '숫자' },
		{ type: 'select', label: '선택' },
		{ type: 'checkbox', label: '체크박스' },
		{ type: 'radio', label: '라디오' },
		{ type: 'textarea', label: '텍스트영역' }
	] as const;

	function handleDragStart(e: DragEvent, controlType: string) {
		if (!e.dataTransfer) return;
		draggedControl = controlType;
		e.dataTransfer.setData('text/plain', controlType);
		e.dataTransfer.effectAllowed = 'move';
	}

	function handleDragOver(e: DragEvent, zone: string) {
		e.preventDefault();
		if (!e.dataTransfer) return;
		e.dataTransfer.dropEffect = 'move';
		dropTarget = zone;
	}

	function handleDragLeave() {
		dropTarget = null;
	}

	function handleDrop(e: DragEvent, zone: string) {
		e.preventDefault();
		if (!e.dataTransfer || !form) return;
		const controlType = e.dataTransfer.getData('text/plain');
		
		// 새로운 컨트롤 추가
		const controlId = `${controlType}_${Date.now()}`;
		const newControl: FormField = {
			type: controlType,
			label: `새 ${controlType}`,
			...(controlType === 'select' || controlType === 'radio' ? {
				options: [
					{ value: 'option1', label: '옵션 1' },
					{ value: 'option2', label: '옵션 2' }
				]
			} : {})
		};

		form.model = {
			...form.model,
			[controlId]: newControl
		};

		draggedControl = null;
		dropTarget = null;
	}

	function deleteControl(controlId: string) {
		if (!form) return;
		const { [controlId]: _, ...restModel } = form.model;
		form.model = restModel;
	}

	function handleEditControl(controlId: string) {
		editingControlId = controlId;
	}

	function handleControlUpdate(controlId: string, updatedControl: FormField) {
		if (!controlId || !form) return;
		form.model = {
			...form.model,
			[controlId]: updatedControl
		};
		editingControlId = null;
	}

	function handleCloseProperties() {
		editingControlId = null;
	}
</script>

<div class="form-builder">
	<div class="control-panel">
		<h3 class="text-lg font-semibold mb-4">컴포넌트</h3>
		<div class="grid grid-cols-2 gap-2">
			{#each controlTypes as { type, label }}
				<div
					class="control-item p-2 bg-gray-100 rounded cursor-move"
					draggable="true"
					ondragstart={(e) => handleDragStart(e, type)}
				>
					{label}
				</div>
			{/each}
		</div>
	</div>

	<div class="form-preview"
		ondragover={(e) => handleDragOver(e, 'preview')}
		ondragleave={handleDragLeave}
		ondrop={(e) => handleDrop(e, 'preview')}
		class:drop-target={dropTarget === 'preview'}
	>
		<div class="form-header mb-6">
			<input
				type="text"
				class="text-2xl font-bold w-full mb-2 p-2 border-b border-transparent focus:border-blue-500 outline-none"
				placeholder="폼 제목"
				bind:value={form.title}
			/>
			<textarea
				class="w-full p-2 border-b border-transparent focus:border-blue-500 outline-none resize-none"
				placeholder="폼 설명"
				bind:value={form.description}
			></textarea>
		</div>

		{#if form?.model}
			{#each Object.entries(form.model) as [controlId, control]}
				{@const typedControl = control as FormField}
				<div class="form-control relative p-4 border rounded mb-4 hover:shadow-md">
					<div class="control-header flex justify-between items-center mb-2">
						<span class="font-medium">{typedControl.label}</span>
						<div class="control-actions space-x-2">
							<button
								class="text-blue-500 hover:text-blue-700"
								onclick={() => handleEditControl(controlId)}
							>
								편집
							</button>
							<button
								class="text-red-500 hover:text-red-700"
								onclick={() => deleteControl(controlId)}
							>
								삭제
							</button>
						</div>
					</div>

					{#if typedControl.type === 'text' || typedControl.type === 'number'}
						<input
							type={typedControl.type}
							class="w-full p-2 border rounded"
							placeholder={typedControl.label}
							disabled
						/>
					{:else if typedControl.type === 'textarea'}
						<textarea
							class="w-full p-2 border rounded"
							placeholder={typedControl.label}
							disabled
						></textarea>
					{:else if typedControl.type === 'select'}
						<select class="w-full p-2 border rounded" disabled>
							{#each typedControl.options || [] as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					{:else if typedControl.type === 'checkbox'}
						<label class="flex items-center">
							<input type="checkbox" disabled />
							<span class="ml-2">{typedControl.label}</span>
						</label>
					{:else if typedControl.type === 'radio'}
						<div class="space-y-2">
							{#each typedControl.options || [] as option}
								<label class="flex items-center">
									<input type="radio" name={controlId} disabled />
									<span class="ml-2">{option.label}</span>
								</label>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	{#if editingControlId && form?.model[editingControlId]}
		<div class="properties-panel">
			<ControlProperties
				control={form.model[editingControlId] as FormField}
				onUpdate={(updatedControl) => handleControlUpdate(editingControlId, updatedControl)}
				onClose={handleCloseProperties}
			/>
		</div>
	{/if}
</div>

<style>
	.form-builder {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: 2rem;
		padding: 1rem;
		height: 100%;
	}

	.control-panel {
		background: white;
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.control-item {
		transition: all 0.2s;
	}

	.control-item:hover {
		background-color: #f3f4f6;
	}

	.form-preview {
		background: white;
		padding: 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		min-height: 500px;
	}

	.form-preview.drop-target {
		background-color: #f3f4f6;
		border: 2px dashed #6b7280;
	}

	.properties-panel {
		position: fixed;
		top: 0;
		right: 0;
		width: 300px;
		height: 100vh;
		background: white;
		box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
		padding: 1rem;
		overflow-y: auto;
	}
</style>
