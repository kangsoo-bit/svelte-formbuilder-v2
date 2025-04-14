<!-- FormBuilder.svelte -->
<script lang="ts">
	import type { FormData, FormModel, FormErrors, FormBuilderProps, FormField } from '$lib/types/form';
	import ControlProperties from './ControlProperties.svelte';

	let props = $props();
	let formName = props.formName ?? '';
	let templates = props.templates ?? [];

	let actions = $state<Array<{ type: string; handler: () => void }>>([]);
	let data = $state<FormData>({});
	let model = $state<FormModel>({});
	let errors = $state<FormErrors>({});
	let hideControls = $state<string[]>([]);
	let readOnlyControls = $state<string[]>([]);
	let readOnly = $state(false);
	let draggedControl = $state<string | null>(null);
	let dropTarget = $state<string | null>(null);
	let editingControlId = $state<string | null>(null);

	function getForm(formName: string): Promise<{ model: FormModel; initialData: FormData }> {
		// 폼 소스를 가져오는 함수
		return fetch(`/api/forms/${formName}.json`)
			.then((response) => response.json())
			.catch((error) => {
				console.error('Error fetching form:', error);
				return null;
			});
	}

	function getFormList(): Promise<string[]> {
		// 폼 목록을 가져오는 함수
		return fetch('/api/forms')
			.then((response) => response.json())
			.catch((error) => {
				console.error('Error fetching form list:', error);
				return [];
			});
	}

	function getAdditionalDataForControl(controlId: string): Promise<unknown> {
		// 컨트롤에 대한 추가 데이터를 가져오는 함수
		return fetch(`/api/controls/${controlId}/data`)
			.then((response) => response.json())
			.catch((error) => {
				console.error('Error fetching control data:', error);
				return null;
			});
	}

	function handleDataChange(form: null, { key, value }: { key: string; value: string | boolean }) {
		data = { ...data, [key]: value };
	}

	function handleEvent(args: unknown) {
		console.log('Form event:', args);
	}

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
		if (!e.dataTransfer) return;
		const controlType = e.dataTransfer.getData('text/plain') as FormField['type'];
		
		// 새로운 컨트롤 추가
		const controlId = `${controlType}_${Date.now()}`;
		const newControl: FormField = {
			id: controlId,
			type: controlType,
			label: `새 ${controlType}`,
			...(controlType === 'select' ? {
				options: [
					{ value: 'option1', label: '옵션 1' },
					{ value: 'option2', label: '옵션 2' }
				]
			} : {})
		};

		model = {
			...model,
			[controlId]: newControl
		};

		draggedControl = null;
		dropTarget = null;
	}

	function deleteControl(controlId: string) {
		const { [controlId]: _, ...restModel } = model;
		model = restModel;
	}

	function handleEditControl(controlId: string) {
		editingControlId = controlId;
	}

	function handleControlUpdate(controlId: string, updatedControl: FormField) {
		if (!controlId) return;
		model = {
			...model,
			[controlId]: updatedControl
		};
		editingControlId = null;
	}

	function handleCloseProperties() {
		editingControlId = null;
	}
</script>

<div class="form-builder">
	<div class="toolbar">
		<button onclick={() => readOnly = !readOnly}>
			{readOnly ? '편집 모드' : '읽기 전용 모드'}
		</button>
	</div>

	<div class="form-container" class:readonly={readOnly}>
		<div class="form-preview" 
			ondragover={(e) => handleDragOver(e, 'preview')}
			ondragleave={handleDragLeave}
			ondrop={(e) => handleDrop(e, 'preview')}
			class:drop-target={dropTarget === 'preview'}
		>
			{#if formName}
				<h2>{formName}</h2>
			{/if}
			<!-- 폼 미리보기 영역 -->
			{#each Object.entries(model) as [controlId, control]}
				{@const typedControl = control as FormField}
				<div class="form-control">
					<div class="control-header">
						<span>{typedControl.label}</span>
						<div class="control-actions">
							<button class="edit-btn" onclick={() => handleEditControl(controlId)}>
								편집
							</button>
							<button class="delete-btn" onclick={() => deleteControl(controlId)}>삭제</button>
						</div>
					</div>
					{#if typedControl.type === 'text'}
						<input type="text" placeholder={typedControl.label} disabled={readOnly} />
					{:else if typedControl.type === 'checkbox'}
						<label>
							<input type="checkbox" disabled={readOnly} />
							{typedControl.label}
						</label>
					{:else if typedControl.type === 'radio'}
						<label>
							<input type="radio" disabled={readOnly} />
							{typedControl.label}
						</label>
					{:else if typedControl.type === 'select' && typedControl.options}
						<select disabled={readOnly}>
							{#each typedControl.options as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					{/if}
				</div>
			{/each}
		</div>

		<div class="form-editor" class:hidden={readOnly}>
			<div class="controls-palette">
				<h3>컨트롤</h3>
				<div class="control-item" 
					draggable="true"
					ondragstart={(e) => handleDragStart(e, 'text')}
				>
					텍스트 입력
				</div>
				<div class="control-item" 
					draggable="true"
					ondragstart={(e) => handleDragStart(e, 'checkbox')}
				>
					체크박스
				</div>
				<div class="control-item" 
					draggable="true"
					ondragstart={(e) => handleDragStart(e, 'radio')}
				>
					라디오 버튼
				</div>
				<div class="control-item" 
					draggable="true"
					ondragstart={(e) => handleDragStart(e, 'select')}
				>
					드롭다운
				</div>
			</div>
		</div>
	</div>

	{#if editingControlId && model[editingControlId]}
		<ControlProperties
			control={model[editingControlId]}
			onUpdate={(updatedControl) => handleControlUpdate(editingControlId!, updatedControl)}
			onClose={handleCloseProperties}
		/>
	{/if}
</div>

<style>
	.form-builder {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}

	.toolbar {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background-color: #f5f5f5;
		border-radius: 4px;
	}

	.form-container {
		display: flex;
		gap: 1rem;
	}

	.form-container.readonly .form-editor {
		display: none;
	}

	.form-preview {
		flex: 2;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		min-height: 300px;
	}

	.form-preview.drop-target {
		border: 2px dashed #007bff;
		background-color: rgba(0, 123, 255, 0.05);
	}

	.form-editor {
		flex: 1;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.controls-palette {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.control-item {
		padding: 0.5rem;
		background-color: #f9f9f9;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: move;
		user-select: none;
	}

	.control-item:hover {
		background-color: #f0f0f0;
	}

	.form-control {
		margin-bottom: 1rem;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: white;
	}

	.control-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.control-actions {
		display: flex;
		gap: 0.5rem;
	}

	.edit-btn {
		padding: 0.25rem 0.5rem;
		background-color: #ffc107;
		color: black;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.edit-btn:hover {
		background-color: #e0a800;
	}

	.delete-btn {
		padding: 0.25rem 0.5rem;
		background-color: #dc3545;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.delete-btn:hover {
		background-color: #c82333;
	}

	.hidden {
		display: none;
	}

	input[type="text"],
	select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		margin-top: 0.25rem;
	}

	label {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
</style>
