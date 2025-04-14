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
	<div class="form-preview">
		<div class="form-preview-inner" bind:this={formPreviewElement}>
			{#each Object.entries(form.model) as [controlId, control]}
				{@const typedControl = control as FormField}
				<div 
					class="control-wrapper"
					style="position: absolute; left: {typedControl.position?.x || 0}px; top: {typedControl.position?.y || 0}px; z-index: {typedControl.position?.zIndex || 1}; width: {typedControl.style?.width || 'auto'}; height: {typedControl.style?.height || 'auto'};"
					draggable="true"
					on:mousedown={(e) => startPositionDrag(e, controlId)}
					on:dragstart={(e) => handleDragStart(e, typedControl.type)}
					on:dragend={handleControlDragEnd}
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
		</div>
	</div>
	
	<div class="properties-panel">
		{#if editingControlId && form?.model[editingControlId]}
			<ControlProperties
				control={form.model[editingControlId] as FormField}
				onUpdate={(updatedControl) => handleControlUpdate(editingControlId, updatedControl)}
				onClose={handleCloseProperties}
			/>
		{/if}
	</div>
</div>

<style>
	.form-builder {
		display: flex;
		gap: 1rem;
		height: 100vh;
		padding: 1rem;
	}

	.form-preview {
		flex: 1;
		position: relative;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		overflow: hidden;
		background: #f5f5f5;
	}

	.form-preview-inner {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 500px;
	}

	.properties-panel {
		width: 300px;
		border-left: 1px solid #ccc;
		padding-left: 1rem;
		overflow-y: auto;
	}

	.control-wrapper {
		cursor: move;
		background: white;
		border: 1px solid transparent;
		border-radius: 0.25rem;
		padding: 0.5rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.control-wrapper:hover {
		border-color: #2563eb;
		box-shadow: 0 4px 6px rgba(37,99,235,0.1);
	}
</style>
