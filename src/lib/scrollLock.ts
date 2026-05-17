/**
 * 참조 카운트 기반 body 스크롤 잠금.
 *
 * Modal과 PageLayout(noScroll)이 각자 document.body.style.overflow를 직접
 * 제어하면, 한 쪽의 cleanup이 다른 쪽의 잠금을 덮어쓰는 문제가 생긴다.
 * 모든 호출자가 이 모듈을 공유해 마지막 해제 시점에만 원복한다.
 */
let lockCount = 0;
let prevOverflow = '';

export function lockBodyScroll(): void {
    if (lockCount === 0) {
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    }
    lockCount += 1;
}

export function unlockBodyScroll(): void {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
        document.body.style.overflow = prevOverflow;
    }
}
