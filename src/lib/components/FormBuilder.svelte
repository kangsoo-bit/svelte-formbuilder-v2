<!-- FormBuilder.svelte -->
<script lang="ts">
	import type { Form, FormField, FormFieldType } from '$lib/types/form';
	import ControlProperties from './ControlProperties.svelte';

	let { form = $bindable({ 
		model: {}, 
		widgetId: crypto.randomUUID(),
		title: '',
		description: '',
		createdAt: new Date(),
		updatedAt: new Date()
	}) } = $props();
	let formPreviewElement: HTMLElement;
	let maxZIndex = $state(1);
	let controlOrder = $state<string[]>([]);
	let draggedControlId = $state<string | null>(null);

	let editingControlId = $state<string | null>(null);
	let draggedControl = $state<string | null>(null);
	let dropTarget = $state<string | null>(null);
	let isDraggingPosition = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });
	let isResizing = $state(false);
	let resizeDirection = $state<string | null>(null);
	let initialSize = $state({ width: 0, height: 0 });
	let initialPosition = $state({ x: 0, y: 0 });
	let isSelecting = $state(false);
	let selectionStart = $state({ x: 0, y: 0 });
	let selectionEnd = $state({ x: 0, y: 0 });
	let selectedControlIds = $state<string[]>([]);

	// 폼 초기화 확인
	$effect(() => {
		if (!form.widgetId) {
			form = {
				...form,
				widgetId: crypto.randomUUID(),
				model: form.model || {}
			};
		}
		if (!form.model) {
			form.model = {};
		}
	});

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
			form.model = {
				...form.model,
				[editingControlId]: {
					...form.model[editingControlId],
					position: {
						...form.model[editingControlId].position,
						x,
						y
					}
				}
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
				id: controlId,
				widgetId: form.widgetId,
				type: controlType as FormFieldType,
				label: `새 ${controlType}`,
				position: {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
					zIndex: maxZIndex++
				},
				style: {
					width: '200px',
					height: '40px'
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

	function startSelection(e: MouseEvent) {
		if (!formPreviewElement || e.target !== formPreviewElement) return;
		
		const rect = formPreviewElement.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		
		isSelecting = true;
		selectionStart = { x, y };
		selectionEnd = { x, y };
		
		window.addEventListener('mousemove', handleSelectionMove);
		window.addEventListener('mouseup', handleSelectionEnd);
	}

	function handleSelectionMove(e: MouseEvent) {
		if (!isSelecting) return;
		
		const rect = formPreviewElement.getBoundingClientRect();
		selectionEnd = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
		
		// 선택 영역과 겹치는 컨트롤들을 찾아서 선택
		const selectionRect = {
			left: Math.min(selectionStart.x, selectionEnd.x),
			top: Math.min(selectionStart.y, selectionEnd.y),
			right: Math.max(selectionStart.x, selectionEnd.x),
			bottom: Math.max(selectionStart.y, selectionEnd.y)
		};

		selectedControlIds = Object.entries(form?.model || {}).filter(([_, control]) => {
			const typedControl = control as FormField;
			const controlLeft = typedControl.position?.x || 0;
			const controlTop = typedControl.position?.y || 0;
			const controlRight = controlLeft + (parseInt(typedControl.style?.width as string) || 200);
			const controlBottom = controlTop + (parseInt(typedControl.style?.height as string) || 40);

			return controlLeft < selectionRect.right &&
				controlRight > selectionRect.left &&
				controlTop < selectionRect.bottom &&
				controlBottom > selectionRect.top;
		}).map(([id]) => id);
	}

	function handleSelectionEnd() {
		if (!isSelecting) return;
		isSelecting = false;
		window.removeEventListener('mousemove', handleSelectionMove);
		window.removeEventListener('mouseup', handleSelectionEnd);
	}

	function startPositionDrag(e: MouseEvent, controlId: string) {
		if (!form?.model || !formPreviewElement) return;
		e.preventDefault();
		e.stopPropagation();

		// Ctrl/Cmd 키를 누르지 않은 상태에서 선택되지 않은 컨트롤을 클릭하면 단일 선택
		if (!e.ctrlKey && !e.metaKey && !selectedControlIds.includes(controlId)) {
			selectedControlIds = [controlId];
		}
		// Ctrl/Cmd 키를 누른 상태에서 클릭하면 토글
		else if ((e.ctrlKey || e.metaKey) && !selectedControlIds.includes(controlId)) {
			selectedControlIds = [...selectedControlIds, controlId];
		}

		isDraggingPosition = true;
		const rect = formPreviewElement.getBoundingClientRect();
		const control = form.model[controlId];
		
		// 드래그 시작 위치 저장
		dragOffset = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};

		// 선택된 각 컨트롤의 초기 위치를 저장
		selectedControlIds.forEach(id => {
			const control = form.model[id];
			control.initialDragPosition = {
				x: control.position?.x || 0,
				y: control.position?.y || 0
			};
		});

		window.addEventListener('mousemove', handlePositionDragMove);
		window.addEventListener('mouseup', handlePositionDragEnd);
	}

	function handlePositionDragMove(e: MouseEvent) {
		if (!isDraggingPosition || !form?.model) return;

		const rect = formPreviewElement.getBoundingClientRect();
		const currentX = e.clientX - rect.left;
		const currentY = e.clientY - rect.top;
		
		// 마우스 이동 거리 계산
		const deltaX = currentX - dragOffset.x;
		const deltaY = currentY - dragOffset.y;

		// 선택된 모든 컨트롤의 위치를 업데이트
		form.model = {
			...form.model,
			...Object.fromEntries(
				selectedControlIds.map(id => {
					const control = form.model[id];
					const initialPos = control.initialDragPosition || { x: control.position?.x || 0, y: control.position?.y || 0 };
					
					return [id, {
						...control,
						position: {
							...control.position,
							x: Math.max(0, initialPos.x + deltaX),
							y: Math.max(0, initialPos.y + deltaY)
						}
					}];
				})
			)
		};
	}

	function handlePositionDragEnd() {
		if (!form?.model) return;
		
		// 초기 드래그 위치 정보 제거
		selectedControlIds.forEach(id => {
			if (form.model[id]) {
				delete form.model[id].initialDragPosition;
			}
		});

		isDraggingPosition = false;
		window.removeEventListener('mousemove', handlePositionDragMove);
		window.removeEventListener('mouseup', handlePositionDragEnd);
	}

	function handleControlClick(e: MouseEvent, controlId: string) {
		e.stopPropagation();
		
		if (e.ctrlKey || e.metaKey) {
			// Ctrl/Cmd + 클릭: 선택 토글
			selectedControlIds = selectedControlIds.includes(controlId)
				? selectedControlIds.filter(id => id !== controlId)
				: [...selectedControlIds, controlId];
		} else {
			// 일반 클릭: 단일 선택
			selectedControlIds = [controlId];
		}
		
		handleEditControl(controlId);
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
		
		// 모델 업데이트
		form.model = {
			...form.model,
			[controlId]: updatedControl
		};
		
		// 속성창은 닫지 않고 계속 열어둡니다.
		// editingControlId = null;
	}

	function handleCloseProperties() {
		editingControlId = null;
	}

	function startResize(e: MouseEvent, controlId: string, direction: string) {
		if (!form?.model[controlId] || !formPreviewElement) return;
		e.preventDefault();
		e.stopPropagation();
		
		editingControlId = controlId;
		isResizing = true;
		resizeDirection = direction;

		const control = form.model[controlId];
		const element = e.target as HTMLElement;
		const controlElement = element.closest('.control-wrapper') as HTMLElement;
		
		initialSize = {
			width: controlElement.offsetWidth,
			height: controlElement.offsetHeight
		};
		
		initialPosition = {
			x: control.position?.x || 0,
			y: control.position?.y || 0
		};

		window.addEventListener('mousemove', handleResizeMove);
		window.addEventListener('mouseup', handleResizeEnd);
	}

	function handleResizeMove(e: MouseEvent) {
		if (!isResizing || !editingControlId || !form?.model[editingControlId]) return;

		const rect = formPreviewElement.getBoundingClientRect();
		const control = form.model[editingControlId];
		let newWidth = initialSize.width;
		let newHeight = initialSize.height;
		let newX = initialPosition.x;
		let newY = initialPosition.y;

		if (resizeDirection?.includes('e')) {
			newWidth = Math.max(100, e.clientX - rect.left - initialPosition.x);
		}
		if (resizeDirection?.includes('s')) {
			newHeight = Math.max(40, e.clientY - rect.top - initialPosition.y);
		}
		if (resizeDirection?.includes('w')) {
			const deltaX = e.clientX - rect.left - initialPosition.x;
			newWidth = Math.max(100, initialSize.width - deltaX);
			newX = initialPosition.x + deltaX;
		}
		if (resizeDirection?.includes('n')) {
			const deltaY = e.clientY - rect.top - initialPosition.y;
			newHeight = Math.max(40, initialSize.height - deltaY);
			newY = initialPosition.y + deltaY;
		}

		form.model = {
			...form.model,
			[editingControlId]: {
				...control,
				position: {
					...control.position,
					x: newX,
					y: newY
				},
				style: {
					...control.style,
					width: `${newWidth}px`,
					height: `${newHeight}px`
				}
			}
		};
	}

	function handleResizeEnd() {
		isResizing = false;
		resizeDirection = null;
		window.removeEventListener('mousemove', handleResizeMove);
		window.removeEventListener('mouseup', handleResizeEnd);
	}

	function handleControlKeyDown(e: KeyboardEvent, controlId: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			selectedControlIds = [controlId];
			editingControlId = controlId;
		}
	}
</script>

<div class="form-builder">
	<div class="form-header">
		<input 
			type="text" 
			class="form-title-input"
			placeholder="폼 제목을 입력하세요"
			bind:value={form.title}
		/>
		<textarea 
			class="form-description-input"
			placeholder="폼 설명을 입력하세요"
			bind:value={form.description}
		></textarea>
	</div>

	<div class="controls-panel">
		<h2 class="panel-title">컨트롤 목록</h2>
		<div class="control-list">
			{#each controlTypes as { type, label }}
				<div
					class="control-item"
					draggable="true"
					ondragstart={(e) => handleDragStart(e, type)}
					role="button"
					tabindex="0"
				>
					<span class="control-icon">
						{#if type === 'text'}
							<span>Aa</span>
						{:else if type === 'number'}
							<span>123</span>
						{:else if type === 'select'}
							<span>▼</span>
						{:else if type === 'checkbox'}
							<span>☐</span>
						{:else if type === 'radio'}
							<span>◉</span>
						{:else if type === 'textarea'}
							<span>📝</span>
						{/if}
					</span>
					<span class="control-label">{label}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="form-preview" 
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onclick={() => {
			if (editingControlId) {
				editingControlId = null;
			}
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				if (editingControlId) {
					editingControlId = null;
				}
			}
		}}
		onmousedown={startSelection}
		role="toolbar"
		tabindex="0"
	>
		{#if isSelecting}
			<div
				class="selection-box"
				style="
					left: {Math.min(selectionStart.x, selectionEnd.x)}px;
					top: {Math.min(selectionStart.y, selectionEnd.y)}px;
					width: {Math.abs(selectionEnd.x - selectionStart.x)}px;
					height: {Math.abs(selectionEnd.y - selectionStart.y)}px;
				"
			></div>
		{/if}
		<div class="form-preview-inner" bind:this={formPreviewElement}>
			{#each Object.entries(form.model) as [controlId, control]}
				{@const typedControl = control as FormField}
				<div 
					class="control-wrapper"
					class:selected={selectedControlIds.includes(controlId)}
					style="
						transform: translate({typedControl.position?.x || 0}px, {typedControl.position?.y || 0}px);
						z-index: {typedControl.position?.zIndex || 1};
						width: {typedControl.style?.width || '200px'};
						height: {typedControl.style?.height || '40px'};
						margin: {typedControl.style?.margin || '0'};
						padding: {typedControl.style?.padding || '0'};
						border: {typedControl.style?.border || '1px solid #e5e7eb'};
						border-radius: {typedControl.style?.borderRadius || '0.375rem'};
						background-color: {typedControl.style?.backgroundColor || 'white'};
					"
					draggable="true"
					onmousedown={(e) => startPositionDrag(e, controlId)}
					ondragstart={(e) => handleControlDragStart(e, controlId)}
					ondragend={handleControlDragEnd}
					onclick={(e) => handleControlClick(e, controlId)}
					onkeydown={(e) => handleControlKeyDown(e, controlId)}
					role="button"
					tabindex="0"
				>
					{#if editingControlId === controlId}
						<div class="resize-handle n" onmousedown={(e) => startResize(e, controlId, 'n')} role="button" aria-label="위쪽 크기 조절" tabindex="0"></div>
						<div class="resize-handle e" onmousedown={(e) => startResize(e, controlId, 'e')} role="button" aria-label="오른쪽 크기 조절" tabindex="0"></div>
						<div class="resize-handle s" onmousedown={(e) => startResize(e, controlId, 's')} role="button" aria-label="아래쪽 크기 조절" tabindex="0"></div>
						<div class="resize-handle w" onmousedown={(e) => startResize(e, controlId, 'w')} role="button" aria-label="왼쪽 크기 조절" tabindex="0"></div>
						<div class="resize-handle ne" onmousedown={(e) => startResize(e, controlId, 'ne')} role="button" aria-label="오른쪽 위 크기 조절" tabindex="0"></div>
						<div class="resize-handle se" onmousedown={(e) => startResize(e, controlId, 'se')} role="button" aria-label="오른쪽 아래 크기 조절" tabindex="0"></div>
						<div class="resize-handle sw" onmousedown={(e) => startResize(e, controlId, 'sw')} role="button" aria-label="왼쪽 아래 크기 조절" tabindex="0"></div>
						<div class="resize-handle nw" onmousedown={(e) => startResize(e, controlId, 'nw')} role="button" aria-label="왼쪽 위 크기 조절" tabindex="0"></div>
					{/if}
					<div class="control-content">
						<div class="control-header">
							<span class="control-title" style="
								font-size: {typedControl.style?.fontSize || '0.875rem'};
								font-weight: {typedControl.style?.fontWeight || '500'};
								color: {typedControl.style?.color || '#374151'};
							">{typedControl.label}</span>
							<button
								class="delete-button"
								onclick={(e) => {
									e.stopPropagation();
									deleteControl(controlId);
								}}
							>
								×
							</button>
						</div>

						<div class="control-field">
							{#if typedControl.type === 'text'}
								<label class="control-label">
									{typedControl.label}
									<input
										type="text"
										class="form-input"
										placeholder={typedControl.placeholder || typedControl.label}
										style="
											width: 100%;
											height: 100%;
											font-size: {typedControl.style?.fontSize || '0.875rem'};
											font-weight: {typedControl.style?.fontWeight || 'normal'};
											color: {typedControl.style?.color || '#4b5563'};
											background-color: {typedControl.style?.backgroundColor || '#f9fafb'};
											border: {typedControl.style?.border || '1px solid #d1d5db'};
											border-radius: {typedControl.style?.borderRadius || '0.375rem'};
											padding: {typedControl.style?.padding || '0.5rem'};
											margin: {typedControl.style?.margin || '0'};
											box-sizing: border-box;
										"
										disabled
									/>
								</label>
							{:else if typedControl.type === 'number'}
								<label class="control-label">
									{typedControl.label}
									<input
										type="number"
										class="form-input"
										placeholder={typedControl.placeholder || typedControl.label}
										min={typedControl.min}
										max={typedControl.max}
										step={typedControl.step}
										style="
											width: 100%;
											height: 100%;
											font-size: {typedControl.style?.fontSize || '0.875rem'};
											font-weight: {typedControl.style?.fontWeight || 'normal'};
											color: {typedControl.style?.color || '#4b5563'};
											background-color: {typedControl.style?.backgroundColor || '#f9fafb'};
											border: {typedControl.style?.border || '1px solid #d1d5db'};
											border-radius: {typedControl.style?.borderRadius || '0.375rem'};
											padding: {typedControl.style?.padding || '0.5rem'};
											margin: {typedControl.style?.margin || '0'};
											box-sizing: border-box;
										"
										disabled
									/>
								</label>
							{:else if typedControl.type === 'textarea'}
								<label class="control-label">
									{typedControl.label}
									<textarea
										class="form-textarea"
										placeholder={typedControl.placeholder || typedControl.label}
										style="
											width: 100%;
											height: 100%;
											font-size: {typedControl.style?.fontSize || '0.875rem'};
											font-weight: {typedControl.style?.fontWeight || 'normal'};
											color: {typedControl.style?.color || '#4b5563'};
											background-color: {typedControl.style?.backgroundColor || '#f9fafb'};
											border: {typedControl.style?.border || '1px solid #d1d5db'};
											border-radius: {typedControl.style?.borderRadius || '0.375rem'};
											padding: {typedControl.style?.padding || '0.5rem'};
											margin: {typedControl.style?.margin || '0'};
											box-sizing: border-box;
											resize: none;
										"
										disabled
									></textarea>
								</label>
							{:else if typedControl.type === 'select'}
								<label class="control-label">
									{typedControl.label}
									<select 
										class="form-select"
										style="
											width: 100%;
											height: 100%;
											font-size: {typedControl.style?.fontSize || '0.875rem'};
											font-weight: {typedControl.style?.fontWeight || 'normal'};
											color: {typedControl.style?.color || '#4b5563'};
											background-color: {typedControl.style?.backgroundColor || '#f9fafb'};
											border: {typedControl.style?.border || '1px solid #d1d5db'};
											border-radius: {typedControl.style?.borderRadius || '0.375rem'};
											padding: {typedControl.style?.padding || '0.5rem'};
											margin: {typedControl.style?.margin || '0'};
											box-sizing: border-box;
											cursor: not-allowed;
										"
										disabled
									>
										<option value="">{typedControl.placeholder || '선택하세요'}</option>
										{#each typedControl.options || [] as option}
											<option value={option.value}>{option.label}</option>
										{/each}
									</select>
								</label>
							{:else if typedControl.type === 'checkbox'}
								<label class="control-label">
									{typedControl.label}
									<div 
										class="form-checkbox-group"
										style="
											display: flex;
											flex-direction: column;
											gap: 0.5rem;
											font-size: {typedControl.style?.fontSize || '0.875rem'};
											font-weight: {typedControl.style?.fontWeight || 'normal'};
											color: {typedControl.style?.color || '#4b5563'};
											padding: {typedControl.style?.padding || '0.5rem'};
											margin: {typedControl.style?.margin || '0'};
											height: 100%;
											box-sizing: border-box;
										"
									>
										<label class="form-checkbox">
											<input 
												type="checkbox"
												style="
													accent-color: {typedControl.style?.accentColor || '#2563eb'};
													cursor: not-allowed;
												"
												disabled 
											/>
											<span>{typedControl.label}</span>
										</label>
									</div>
								</label>
							{:else if typedControl.type === 'radio'}
								<label class="control-label">
									{typedControl.label}
									<div 
										class="form-radio-group"
										style="
											display: flex;
											flex-direction: column;
											gap: 0.5rem;
											font-size: {typedControl.style?.fontSize || '0.875rem'};
											font-weight: {typedControl.style?.fontWeight || 'normal'};
											color: {typedControl.style?.color || '#4b5563'};
											padding: {typedControl.style?.padding || '0.5rem'};
											margin: {typedControl.style?.margin || '0'};
											height: 100%;
											box-sizing: border-box;
										"
									>
										{#each typedControl.options || [] as option}
											<label class="form-radio">
												<input 
													type="radio"
													name={controlId}
													style="
														accent-color: {typedControl.style?.accentColor || '#2563eb'};
														cursor: not-allowed;
													"
													disabled 
												/>
												<span>{option.label}</span>
											</label>
										{/each}
									</div>
								</label>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
	
	<div class="properties-panel">
		{#if editingControlId && form?.model[editingControlId]}
			<ControlProperties
				control={form.model[editingControlId]}
				onUpdate={(updatedControl: FormField) => {
					if (editingControlId) handleControlUpdate(editingControlId, updatedControl);
				}}
				onclose={handleCloseProperties}
			/>
		{/if}
	</div>
</div>

<style>
	.form-builder {
		display: grid;
		grid-template-rows: auto 1fr;
		grid-template-columns: 200px 1fr 300px;
		gap: 1rem;
		height: 100vh;
		padding: 1rem;
		background: #f9fafb;
		max-width: 100%;
		margin: 0;
		box-sizing: border-box;
	}

	.form-header {
		grid-column: 1 / -1;
		padding: 1rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.form-title-input {
		width: 100%;
		padding: 0.75rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		margin-bottom: 0.75rem;
		background: #f9fafb;
		transition: all 0.2s ease;
	}

	.form-title-input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
	}

	.form-description-input {
		width: 100%;
		padding: 0.75rem;
		font-size: 0.875rem;
		color: #4b5563;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		background: #f9fafb;
		resize: vertical;
		min-height: 60px;
		transition: all 0.2s ease;
	}

	.form-description-input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
	}

	.controls-panel {
		width: 200px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
	}

	.panel-title {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 1rem 0;
	}

	.control-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.control-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		cursor: move;
		user-select: none;
		transition: all 0.2s ease;
	}

	.control-item:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.control-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background: #e5e7eb;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.control-label {
		font-size: 0.875rem;
		color: #4b5563;
	}

	.form-preview {
		position: relative;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		min-width: 0;
		box-sizing: border-box;
	}

	.form-preview-inner {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 500px;
	}

	.properties-panel {
		width: 300px;
		border-left: 1px solid #e5e7eb;
		padding: 1rem;
		overflow-y: auto;
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
	}

	.control-wrapper {
		position: absolute;
		cursor: move;
		user-select: none;
		min-width: 100px;
		box-sizing: border-box;
		transition: box-shadow 0.2s ease;
		display: flex;
		flex-direction: column;
		transform: translate(0, 0);
	}

	.control-wrapper.selected {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
	}

	.control-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: white;
		box-sizing: border-box;
	}

	.control-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0.5rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	.control-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.delete-button {
		padding: 0;
		width: 20px;
		height: 20px;
		border: none;
		background: none;
		color: #9ca3af;
		cursor: pointer;
		font-size: 1.25rem;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
	}

	.delete-button:hover {
		background: #f3f4f6;
		color: #ef4444;
	}

	.control-field {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0.25rem;
		box-sizing: border-box;
	}

	.form-input,
	.form-select,
	.form-textarea {
		width: 100%;
		height: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background: #f9fafb;
		color: #4b5563;
		box-sizing: border-box;
		font-size: 0.875rem;
	}

	.form-textarea {
		min-height: 100px;
		resize: none;
	}

	.form-checkbox,
	.form-radio {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: not-allowed;
	}

	.form-checkbox-group,
	.form-radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		height: 100%;
		overflow-y: auto;
	}

	.checkbox-label,
	.radio-label {
		font-size: 0.875rem;
		color: #4b5563;
	}

	input[type="checkbox"],
	input[type="radio"] {
		width: 1rem;
		height: 1rem;
		cursor: not-allowed;
	}

	.resize-handle {
		position: absolute;
		background: #2563eb;
		z-index: 1;
	}

	.resize-handle.n {
		top: -3px;
		left: 0;
		right: 0;
		height: 6px;
		cursor: n-resize;
	}

	.resize-handle.e {
		top: 0;
		right: -3px;
		bottom: 0;
		width: 6px;
		cursor: e-resize;
	}

	.resize-handle.s {
		bottom: -3px;
		left: 0;
		right: 0;
		height: 6px;
		cursor: s-resize;
	}

	.resize-handle.w {
		top: 0;
		left: -3px;
		bottom: 0;
		width: 6px;
		cursor: w-resize;
	}

	.resize-handle.ne {
		top: -3px;
		right: -3px;
		width: 6px;
		height: 6px;
		cursor: ne-resize;
	}

	.resize-handle.se {
		bottom: -3px;
		right: -3px;
		width: 6px;
		height: 6px;
		cursor: se-resize;
	}

	.resize-handle.sw {
		bottom: -3px;
		left: -3px;
		width: 6px;
		height: 6px;
		cursor: sw-resize;
	}

	.resize-handle.nw {
		top: -3px;
		left: -3px;
		width: 6px;
		height: 6px;
		cursor: nw-resize;
	}

	.selection-box {
		position: absolute;
		border: 2px solid #2563eb;
		background: rgba(37, 99, 235, 0.1);
		pointer-events: none;
		z-index: 9999;
	}
</style>
