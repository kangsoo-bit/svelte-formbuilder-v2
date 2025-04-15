import { test, expect } from '@playwright/test';

test.describe('입사지원서 양식 생성 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 폼 빌더 페이지로 이동
    await page.goto('/form-builder');
  });

  test('입사지원서 양식 생성 및 검증', async ({ page }) => {
    // 1. 서식 생성 및 기본 정보 입력
    await test.step('서식 기본 정보 입력', async () => {
      await page.getByPlaceholder('폼 제목을 입력하세요').fill('2024년 상반기 신입사원 입사지원서');
      await page.getByPlaceholder('폼 설명을 입력하세요').fill('2024년 상반기 공개채용 입사지원서입니다. 모든 항목을 빠짐없이 작성해주세요.');
      
      // 제목과 설명이 정상적으로 입력되었는지 확인
      await expect(page.getByPlaceholder('폼 제목을 입력하세요')).toHaveValue('2024년 상반기 신입사원 입사지원서');
      await expect(page.getByPlaceholder('폼 설명을 입력하세요')).toHaveValue('2024년 상반기 공개채용 입사지원서입니다. 모든 항목을 빠짐없이 작성해주세요.');
    });

    // 2. 지원자 정보 섹션 컨트롤 추가
    await test.step('지원자 정보 섹션 생성', async () => {
      // 이름 입력 필드 추가
      const textControl = page.getByRole('listitem').filter({ hasText: '텍스트' });
      await textControl.dragTo(page.locator('.form-preview'));
      await page.getByPlaceholder('라벨을 입력하세요').fill('이름');
      
      // 생년월일 입력 필드 추가
      const numberControl = page.getByRole('listitem').filter({ hasText: '숫자' });
      await numberControl.dragTo(page.locator('.form-preview'));
      await page.getByPlaceholder('라벨을 입력하세요').fill('생년월일');
      
      // 성별 선택 필드 추가
      const selectControl = page.getByRole('listitem').filter({ hasText: '선택' });
      await selectControl.dragTo(page.locator('.form-preview'));
      await page.getByPlaceholder('라벨을 입력하세요').fill('성별');
      await page.getByPlaceholder('옵션을 입력하세요').fill('남성\n여성');
    });

    // 3. 학력 사항 섹션 컨트롤 추가
    await test.step('학력 사항 섹션 생성', async () => {
      // 최종학력 선택 필드 추가
      const selectControl = page.getByRole('listitem').filter({ hasText: '선택' });
      await selectControl.dragTo(page.locator('.form-preview'));
      await page.getByPlaceholder('라벨을 입력하세요').fill('최종학력');
      await page.getByPlaceholder('옵션을 입력하세요').fill('고졸\n전문대졸\n대졸\n석사\n박사');
      
      // 학교명 입력 필드 추가
      const textControl = page.getByRole('listitem').filter({ hasText: '텍스트' });
      await textControl.dragTo(page.locator('.form-preview'));
      await page.getByPlaceholder('라벨을 입력하세요').fill('학교명');
    });

    // 4. 자기소개서 섹션 컨트롤 추가
    await test.step('자기소개서 섹션 생성', async () => {
      // 자기소개 텍스트영역 추가
      const textareaControl = page.getByRole('listitem').filter({ hasText: '텍스트영역' });
      await textareaControl.dragTo(page.locator('.form-preview'));
      await page.getByPlaceholder('라벨을 입력하세요').fill('자기소개');
      
      // 개인정보 동의 체크박스 추가
      const checkboxControl = page.getByRole('listitem').filter({ hasText: '체크박스' });
      await checkboxControl.dragTo(page.locator('.form-preview'));
      await page.getByPlaceholder('라벨을 입력하세요').fill('개인정보 수집 및 이용에 동의합니다');
    });

    // 5. 양식 저장
    await test.step('양식 저장', async () => {
      await page.getByRole('button', { name: '저장' }).click();
      // 저장 완료 메시지 확인
      await expect(page.getByText('양식이 저장되었습니다')).toBeVisible();
    });

    // 6. 미리보기 확인
    await test.step('미리보기 검증', async () => {
      await page.getByRole('button', { name: '미리보기' }).click();
      
      // 기본 정보 검증
      await expect(page.getByText('2024년 상반기 신입사원 입사지원서')).toBeVisible();
      await expect(page.getByText('2024년 상반기 공개채용 입사지원서입니다. 모든 항목을 빠짐없이 작성해주세요.')).toBeVisible();
      
      // 필드 존재 여부 검증
      await expect(page.getByLabel('이름')).toBeVisible();
      await expect(page.getByLabel('생년월일')).toBeVisible();
      await expect(page.getByLabel('성별')).toBeVisible();
      await expect(page.getByLabel('최종학력')).toBeVisible();
      await expect(page.getByLabel('학교명')).toBeVisible();
      await expect(page.getByLabel('자기소개')).toBeVisible();
      await expect(page.getByLabel('개인정보 수집 및 이용에 동의합니다')).toBeVisible();
      
      // 선택 옵션 검증
      await expect(page.getByRole('combobox', { name: '성별' })).toContainText(['남성', '여성']);
      await expect(page.getByRole('combobox', { name: '최종학력' })).toContainText(['고졸', '전문대졸', '대졸', '석사', '박사']);
    });
  });
}); 