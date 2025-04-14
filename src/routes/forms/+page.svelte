<script lang="ts">
	import type { Form } from '$lib/types/form';
	import { onMount } from 'svelte';

	let forms = $state<Form[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await fetch('/api/forms');
			if (!response.ok) {
				throw new Error('Failed to load forms');
			}
			forms = await response.json();
		} catch (err) {
			error = '폼 목록을 불러오는데 실패했습니다.';
			console.error('Error loading forms:', err);
		} finally {
			loading = false;
		}
	});

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="forms-page">
	<header>
		<h1>폼 목록</h1>
		<a href="/forms/new" class="new-form-btn">새 폼 만들기</a>
	</header>

	{#if loading}
		<div class="loading">로딩 중...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if forms.length === 0}
		<div class="empty">
			<p>저장된 폼이 없습니다.</p>
			<a href="/forms/new">첫 번째 폼을 만들어보세요!</a>
		</div>
	{:else}
		<div class="forms-grid">
			{#each forms as form}
				<div class="form-card">
					<h2>{form.title}</h2>
					{#if form.description}
						<p class="description">{form.description}</p>
					{/if}
					<div class="meta">
						<span>생성: {formatDate(form.createdAt)}</span>
						<span>수정: {formatDate(form.updatedAt)}</span>
					</div>
					<div class="actions">
						<a href="/forms/{form.id}" class="btn">편집</a>
						<a href="/forms/{form.id}/preview" class="btn">미리보기</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.forms-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin: 0;
	}

	.new-form-btn {
		background-color: #007bff;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		text-decoration: none;
		font-weight: bold;
	}

	.new-form-btn:hover {
		background-color: #0056b3;
	}

	.loading, .error, .empty {
		text-align: center;
		padding: 2rem;
		background-color: #f8f9fa;
		border-radius: 8px;
	}

	.error {
		color: #dc3545;
	}

	.forms-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.form-card {
		background-color: white;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		padding: 1.5rem;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.form-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.form-card h2 {
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
	}

	.description {
		color: #6c757d;
		margin-bottom: 1rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.meta {
		font-size: 0.875rem;
		color: #6c757d;
		margin-bottom: 1rem;
	}

	.meta span {
		display: block;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		flex: 1;
		text-align: center;
		padding: 0.5rem;
		border-radius: 4px;
		text-decoration: none;
		color: white;
		background-color: #6c757d;
	}

	.btn:hover {
		background-color: #5a6268;
	}

	.btn:first-child {
		background-color: #28a745;
	}

	.btn:first-child:hover {
		background-color: #218838;
	}
</style> 