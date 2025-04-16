import type { Form, FormBuilderState } from '$lib/types/form';

export function createResizeHandlers(
	formState: FormBuilderState,
	form: Form,
	formPreviewElement: HTMLElement | null
) {
	function startResize(e: MouseEvent, controlId: string, direction: string) {
		if (!form?.model[controlId] || !formPreviewElement) return;
		e.preventDefault();
		e.stopPropagation();
		
		formState.editingControlId = controlId;
		formState.isResizing = true;
		formState.resizeDirection = direction;

		const control = form.model[controlId];
		const element = e.target as HTMLElement;
		const controlElement = element.closest('.control-wrapper') as HTMLElement;
		
		formState.initialSize = {
			width: controlElement.offsetWidth,
			height: controlElement.offsetHeight
		};
		
		formState.initialPosition = {
			x: control.position?.x || 0,
			y: control.position?.y || 0
		};

		window.addEventListener('mousemove', handleResizeMove);
		window.addEventListener('mouseup', handleResizeEnd);
	}

	function handleResizeMove(e: MouseEvent) {
		if (!formState.isResizing || !formState.editingControlId || !form?.model[formState.editingControlId] || !formPreviewElement) return;

		const rect = formPreviewElement.getBoundingClientRect();
		const control = form.model[formState.editingControlId];
		let newWidth = formState.initialSize.width;
		let newHeight = formState.initialSize.height;
		let newX = formState.initialPosition.x;
		let newY = formState.initialPosition.y;

		if (formState.resizeDirection?.includes('e')) {
			newWidth = Math.max(100, e.clientX - rect.left - formState.initialPosition.x);
		}
		if (formState.resizeDirection?.includes('s')) {
			newHeight = Math.max(40, e.clientY - rect.top - formState.initialPosition.y);
		}
		if (formState.resizeDirection?.includes('w')) {
			const deltaX = e.clientX - rect.left - formState.initialPosition.x;
			newWidth = Math.max(100, formState.initialSize.width - deltaX);
			newX = formState.initialPosition.x + deltaX;
		}
		if (formState.resizeDirection?.includes('n')) {
			const deltaY = e.clientY - rect.top - formState.initialPosition.y;
			newHeight = Math.max(40, formState.initialSize.height - deltaY);
			newY = formState.initialPosition.y + deltaY;
		}

		form.model = {
			...form.model,
			[formState.editingControlId]: {
				...control,
				position: {
					...control.position,
					x: newX,
					y: newY,
					zIndex: control.position?.zIndex || 1
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
		formState.isResizing = false;
		formState.resizeDirection = null;
		window.removeEventListener('mousemove', handleResizeMove);
		window.removeEventListener('mouseup', handleResizeEnd);
	}

	return {
		startResize
	};
} 