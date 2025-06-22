import { createContext, useContext, ReactNode, useCallback, useRef } from 'react';

export type ResetType = 'video-change' | 'full-reset';

type ResetFunction = () => void;

interface ResetSubscription {
    id: string;
    resetFunction: ResetFunction;
    resetTypes: ResetType[];
}

interface ResetContextType {
    triggerReset: (resetType: ResetType) => void;
    subscribe: (id: string, resetFunction: ResetFunction, resetTypes: ResetType[]) => void;
    unsubscribe: (id: string) => void;
}

const ResetContext = createContext<ResetContextType | null>(null);

interface ResetProviderProps {
    children: ReactNode;
}

export const ResetProvider = ({ children }: ResetProviderProps) => {
    const subscriptionsRef = useRef(new Map<string, ResetSubscription>());

    const triggerReset = useCallback((resetType: ResetType) => {
        subscriptionsRef.current.forEach((subscription) => {
            if (subscription.resetTypes.includes(resetType)) {
                subscription.resetFunction();
            }
        });
    }, []);

    const subscribe = useCallback((id: string, resetFunction: ResetFunction, resetTypes: ResetType[]) => {
        subscriptionsRef.current.set(id, { id, resetFunction, resetTypes });
    }, []);

    const unsubscribe = useCallback((id: string) => {
        subscriptionsRef.current.delete(id);
    }, []);

    return (
        <ResetContext.Provider value={{ triggerReset, subscribe, unsubscribe }}>
            {children}
        </ResetContext.Provider>
    );
};

export const useResetContext = (): ResetContextType => {
    const context = useContext(ResetContext);
    if (!context) {
        throw new Error('useResetContext must be used within a ResetProvider');
    }
    return context;
};
