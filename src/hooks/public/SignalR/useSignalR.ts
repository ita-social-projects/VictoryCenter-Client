import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

export const useSignalR = (url: string): HubConnection | null => {
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        const newConnection = new HubConnectionBuilder().withUrl(url).withAutomaticReconnect().build();

        let retryCount = 0;
        const maxRetries = 5;

        const startConnection = async () => {
            try {
                await newConnection.start();
                if (isMounted.current) {
                    setConnection(newConnection);
                }
            } catch (err) {
                if (retryCount < maxRetries && isMounted.current) {
                    const timeout = Math.pow(2, retryCount) * 1000;
                    retryCount++;
                    setTimeout(startConnection, timeout);
                }
            }
        };

        startConnection();

        return () => {
            isMounted.current = false;
            newConnection.stop();
        };
    }, [url]);

    return connection;
};
