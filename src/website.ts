export interface WebsiteAction {
    action: {
        value: string;
        options: any;
    };
    startTime: string;
    endTime: string;
    days: number[];
    alwaysActive: boolean;
    paths: string[];
    pathMatch: 'include' | 'exclude';
}

export interface Website {
    url: string;
    favicon: string;
    actions: WebsiteAction[];
}
