import { useState, useRef, useCallback, useEffect } from 'react';

export const useTableScrollToTop = (recordsLength: number) => {
    const tableWrapperRef = useRef<HTMLDivElement>(null);
    const [isMoveToTopVisible, setIsMoveToTopVisible] = useState(false);

    const updateMoveToTopVisibility = useCallback(() => {
        const wrapper = tableWrapperRef.current;
        if (!wrapper) return;
        const isScrollable = wrapper.scrollHeight > wrapper.clientHeight;
        setIsMoveToTopVisible(isScrollable && wrapper.scrollTop > 0);
    }, []);

    const handleTableScroll = useCallback(() => {
        updateMoveToTopVisibility();
    }, [updateMoveToTopVisibility]);

    const moveToTop = useCallback(() => {
        const wrapper = tableWrapperRef.current;
        if (!wrapper) return;
        wrapper.scrollTop = 0;
        setIsMoveToTopVisible(false);
    }, []);

    useEffect(() => {
        updateMoveToTopVisibility();
    }, [recordsLength, updateMoveToTopVisibility]);

    return { tableWrapperRef, isMoveToTopVisible, handleTableScroll, moveToTop };
};
