<!-- FormBuilder.svelte -->
<script lang="ts">
	import type { Form, FormField } from '$lib/types';
	import ControlProperties from './ControlProperties.svelte';

	let { form = $bindable() } = $props();
	let formPreviewElement: HTMLElement;
	let maxZIndex = $state(1);

	let editingControlId = $state<string | null>(null);
	let draggedControl = $state<string | null>(null);
	let dropTarget = $state<string | null>(null);
	let isDraggingPosition = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });

	// 컨트롤 순서 초기화
	$effect(() => {
		if (form?.model) {
			controlOrder = Object.keys(form.model);
		}
	});

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

	function handleControlDragStart(e: DragEvent, controlId: string) {
		if (!e.dataTransfer) return;
		draggedControlId = controlId;
		e.dataTransfer.setData('application/control-id', controlId);
		e.dataTransfer.effectAllowed = 'move';
		
		// 드래그 중인 요소의 스타일 적용
		const element = e.target as HTMLElement;
		element.style.opacity = '0.4';
	}

	function handleControlDragEnd(e: DragEvent) {
		// 드래그 종료 시 스타일 초기화
		const element = e.target as HTMLElement;
		element.style.opacity = '1';
		draggedControlId = null;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer) return;
		e.dataTransfer.dropEffect = 'move';
		dropTarget = 'preview';

		if (isDraggingPosition && editingControlId && form?.model[editingControlId]) {
			const rect = formPreviewElement.getBoundingClientRect();
			const x = e.clientX - rect.left - dragOffset.x;
			const y = e.clientY - rect.top - dragOffset.y;

			// 위치 업데이트
			const updatedControl = {
				...form.model[editingControlId],
				position: {
					...form.model[editingControlId].position,
					x,
					y
				}
			};

			form.model = {
				...form.model,
				[editingControlId]: updatedControl
			};
		}
	}

	function handleControlDragOver(e: DragEvent, controlId: string) {
		e.preventDefault();
		if (!e.dataTransfer || !draggedControlId || draggedControlId === controlId) return;
		
		const draggedIndex = controlOrder.indexOf(draggedControlId);
		const dropIndex = controlOrder.indexOf(controlId);
		
		// 드래그 중인 요소의 위치에 따라 시각적 표시 변경
		const element = e.currentTarget as HTMLElement;
		const rect = element.getBoundingClientRect();
		const midY = rect.top + rect.height / 2;
		
		if (e.clientY < midY) {
			element.style.borderTop = '2px solid #4299e1';
			element.style.borderBottom = '';
		} else {
			element.style.borderTop = '';
			element.style.borderBottom = '2px solid #4299e1';
		}
	}

	function handleControlDragLeave(e: DragEvent) {
		const element = e.currentTarget as HTMLElement;
		element.style.borderTop = '';
		element.style.borderBottom = '';
	}

	function handleControlDrop(e: DragEvent, targetControlId: string) {
		e.preventDefault();
		if (!e.dataTransfer || !draggedControlId || !form) return;

		const element = e.currentTarget as HTMLElement;
		element.style.borderTop = '';
		element.style.borderBottom = '';

		const draggedIndex = controlOrder.indexOf(draggedControlId);
		const dropIndex = controlOrder.indexOf(targetControlId);
		
		if (draggedIndex === -1 || dropIndex === -1) return;

		// 드롭 위치에 따라 순서 변경
		const rect = element.getBoundingClientRect();
		const midY = rect.top + rect.height / 2;
		const newIndex = e.clientY < midY ? dropIndex : dropIndex + 1;

		// 순서 배열 업데이트
		controlOrder = [
			...controlOrder.slice(0, draggedIndex),
			...controlOrder.slice(draggedIndex + 1)
		];
		controlOrder = [
			...controlOrder.slice(0, newIndex),
			draggedControlId,
			...controlOrder.slice(newIndex)
		];

		draggedControlId = null;
	}

	function handleDragLeave() {
		dropTarget = null;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer || !form || !formPreviewElement) return;
		
		if (draggedControl) {
			const controlType = e.dataTransfer.getData('text/plain');
			const controlId = `${controlType}_${Date.now()}`;
			const rect = formPreviewElement.getBoundingClientRect();
			
			const newControl: FormField = {
				type: controlType,
				label: `새 ${controlType}`,
				position: {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
					zIndex: maxZIndex++
				},
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
		}

		draggedControl = null;
		dropTarget = null;
		isDraggingPosition = false;
	}

	function startPositionDrag(e: MouseEvent, controlId: string) {
		if (!form?.model[controlId]) return;
		e.preventDefault();
		
		editingControlId = controlId;
		isDraggingPosition = true;

		const control = form.model[controlId];
		const rect = (e.target as HTMLElement).getBoundingClientRect();
		
		dragOffset = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};

		// zIndex 업데이트
		const updatedControl = {
			...control,
			position: {
				...control.position,
				zIndex: maxZIndex++
			}
		};

		form.model = {
			...form.model,
			[controlId]: updatedControl
		};
	}

	function handleMouseUp() {
		isDraggingPosition = false;
	}

	function deleteControl(controlId: string) {
		if (!form) return;
		const { [controlId]: _, ...restModel } = form.model;
		form.model = restModel;
		
		// 순서 배열에서도 제거
		controlOrder = controlOrder.filter(id => id !== controlId);
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
		bind:this={formPreviewElement}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onmouseup={handleMouseUp}
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
				<div class="form-control"
					style="
						position: absolute;
						left: {typedControl.position?.x || 0}px;
						top: {typedControl.position?.y || 0}px;
						z-index: {typedControl.position?.zIndex || 1};
						width: {typedControl.style?.width || '200px'};
						{typedControl.style?.height ? `height: ${typedControl.style.height};` : ''}
					"
					onmousedown={(e) => startPositionDrag(e, controlId)}
				>
					<div class="control-content p-4 bg-white border rounded shadow-sm">
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
		position: relative;
	}

	.form-preview.drop-target {
		background-color: #f3f4f6;
		border: 2px dashed #6b7280;
	}

	.form-control {
		cursor: move;
		user-select: none;
	}

	.form-control:hover .control-content {
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
