import { useEffect, useRef } from 'react';
import { useResetContext, ResetType } from '../contexts/ResetContext';

export const useResetSubscription = (
    id: string,
    resetFunction: () => void,
    resetTypes: ResetType[]
): void => {
    const { subscribe, unsubscribe } = useResetContext();
    const resetFunctionRef = useRef(resetFunction);

    resetFunctionRef.current = resetFunction;

    useEffect(() => {
        const wrappedResetFunction = () => resetFunctionRef.current();
        subscribe(id, wrappedResetFunction, resetTypes);

        return () => {
            unsubscribe(id);
        };
    }, [id, resetTypes, subscribe, unsubscribe]);
};
