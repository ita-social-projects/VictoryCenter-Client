import { useState, useEffect } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

export const useSignalR = (url: string): HubConnection | null => {
    const [connection, setConnection] = useState<HubConnection | null>(null);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder().withUrl(url).withAutomaticReconnect().build();

        newConnection
            .start()
            .then(() => {
                setConnection(newConnection);
            })
            .catch((err: Error) => {
                console.error('SignalR Connection Error: ', err);
            });

        return () => {
            newConnection.stop();
        };
    }, [url]);

    return connection;
};
