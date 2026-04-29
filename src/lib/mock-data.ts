
'use client';

import { addDays } from "date-fns";
import { averpayUsers } from './users';

// --- DATA STORE & UTILITIES ---
export let usersData: any[] = [];
export let projectsData: any[] = [];
export let notifications: any[] = [];
export let activityLogs: any[] = [];
export let mockMessages: { [chatId: string]: any[] } = {};

let dataInitialized = false;

// Unified function to save any part of the app's data to localStorage
export const saveData = (key: 'usersData' | 'projectsData' | 'notifications' | 'mockMessages' | 'loggedInUser' | 'activityLogs', data: any) => {
    if (typeof window === 'undefined') return;
    try {
        let dataToSave = data;
        // Dates need to be converted to ISO strings for JSON serialization
        if (key === 'projectsData') {
            dataToSave = data.map((p: any) => ({
                ...p,
                submissionDeadline: p.submissionDeadline instanceof Date ? p.submissionDeadline.toISOString() : p.submissionDeadline,
                submittedAt: p.submittedAt instanceof Date ? p.submittedAt.toISOString() : p.submittedAt
            }));
        }
        localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (error) {
        console.error(`Failed to save data for key ${key} to localStorage`, error);
    }
};


// Unified function to load any part of the app's data from localStorage
const loadData = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            const parsed = JSON.parse(storedValue);
            // Re-hydrate dates if loading project data
            if (key === 'projectsData') {
                 return parsed.map((p: any) => ({
                     ...p,
                     submissionDeadline: p.submissionDeadline ? new Date(p.submissionDeadline) : null,
                     submittedAt: p.submittedAt ? new Date(p.submittedAt) : null,
                 })) as T;
            }
            return parsed;
        }
    } catch (error) {
        console.error(`Failed to load data for key ${key} from localStorage`, error);
    }
    // If no stored value, save the default value for next time
    saveData(key as any, defaultValue);
    return defaultValue;
}


// --- INITIAL DATA DEFINITIONS ---

const defaultActivityLogs = [
    { id: 'act-1', type: 'login', user: 'Bontle Maele', location: 'Gaborone, Botswana', timestamp: new Date().toISOString() },
    { id: 'act-2', type: 'submission', user: 'John Doe', project: 'Sony Review', timestamp: addDays(new Date(), -1).toISOString() },
    { id: 'act-3', type: 'withdrawal', user: 'Ryan Reynolds', amount: 1200, timestamp: addDays(new Date(), -2).toISOString() },
];

const defaultProjects = [
    {
        id: 'proj-sony-01',
        title: 'SONY Product Research & Review',
        assignedTo: 'mock-user-03',
        status: 'approved',
        paymentAmount: 9390,
        submissionDeadline: new Date('2024-06-20T23:59:59'),
        briefUrl: '#',
        submissionUrl: 'mock-submission.pdf',
        submittedAt: new Date('2024-06-18T10:00:00'),
        reviewNote: 'Excellent work, approved.'
    },
    {
        id: 'proj-unilever-01',
        title: 'UNILEVER GLOBAL Product Review',
        assignedTo: 'mock-user-03',
        status: 'approved',
        paymentAmount: 9337,
        submissionDeadline: new Date('2024-07-01T23:59:59'),
        briefUrl: 'https://docs.google.com/document/d/15FoYelSor0E5C3Y7L7KwzqFzM4fgiUUFgv_IJ29j0dg/edit?usp=drivesdk',
        submissionUrl: 'mock-submission.pdf',
        submittedAt: new Date('2024-06-28T11:00:00'),
        reviewNote: 'Fantastic analysis, approved.'
    },
    {
        id: 'proj-nike-01',
        title: 'Nike Global Product Review Assignment',
        assignedTo: 'mock-user-03',
        status: 'approved',
        paymentAmount: 1750,
        submissionDeadline: new Date('2024-07-15T23:59:59'),
        briefUrl: 'https://docs.google.com/document/d/12rBlCPYwGdxSoa_sWbjIO2npENjd-0QMsz3IlzwLDao/edit?usp=drivesdk',
        submissionUrl: 'mock-submission.pdf',
        submittedAt: new Date('2024-07-14T10:00:00'),
        reviewNote: 'Great work, approved!'
    },
    {
        id: 'proj-004',
        title: 'Bang & Olufsen Global Product Review Assignment',
        assignedTo: 'mock-user-03',
        status: 'new',
        paymentAmount: 1650,
        submissionDeadline: addDays(new Date(), 7),
        briefUrl: 'https://docs.google.com/document/d/1JwyRduIcdY-fq0bT-3Rle9AU2MQE1erIAk4/edit?usp=drivesdk',
        submissionUrl: null,
        submittedAt: null,
        reviewNote: null
    }
];

const defaultNotifications = [
    {
        id: 'notif-maint-sync-01',
        type: 'activation-notice',
        title: 'Formal System Maintenance Synchronization Required',
        description: 'Your profile requires a manual update and synchronization fee payment (€450.00) due to maintenance cycle exclusion. Please contact Supervisor Support immediately.',
        timestamp: 'Just now',
        read: false,
        link: '/dashboard/chat'
    },
    {
        id: 'notif-support-01',
        type: 'activation-notice',
        title: 'System Compliance Alert',
        description: 'Priority action required: Account synchronization is pending to restore full withdrawal functionality.',
        timestamp: '1 hour ago',
        read: false,
        link: '/dashboard/chat'
    }
];

const defaultMockMessages = {};


// --- DATA MANIPULATION FUNCTIONS ---

export const findUserById = (uid: string): any | undefined => {
    initializeUsers(); // Ensure data is loaded
    if (!uid) return undefined;
    return usersData.find(u => u.uid === uid);
}

export const updateUserData = (userId: string, newValues: any): any | null => {
    initializeUsers();
    const userIndex = usersData.findIndex(u => u.uid === userId);
    if (userIndex === -1) return null;

    // Deep merge to handle nested objects like bankDetails and notificationPreferences
    const updatedUser = {
        ...usersData[userIndex],
        ...newValues,
        bankDetails: {
            ...usersData[userIndex].bankDetails,
            ...(newValues.bankDetails || {})
        },
        notificationPreferences: {
            ...usersData[userIndex].notificationPreferences,
            ...(newValues.notificationPreferences || {})
        }
    };
    
    usersData[userIndex] = updatedUser;
    saveData('usersData', usersData); // Persist the entire users array

    // Also update loggedInUser if it's the same user
    const loggedInUserRaw = localStorage.getItem('loggedInUser');
    if(loggedInUserRaw) {
        const loggedInUser = JSON.parse(loggedInUserRaw);
        if(loggedInUser.uid === userId) {
            saveData('loggedInUser', updatedUser);
        }
    }
    
    return updatedUser;
};

export const updateProjectData = (projectId: string, newValues: any): any | null => {
    initializeUsers();
    const projectIndex = projectsData.findIndex((p:any) => p.id === projectId);
    if (projectIndex !== -1) {
        projectsData[projectIndex] = { ...projectsData[projectIndex], ...newValues };
        saveData('projectsData', projectsData);
        return projectsData[projectIndex];
    }
    return null;
};

export const addNotification = (userId: string, notification: any) => {
    initializeUsers();
    const newNotification = {
        id: `notif-${Date.now()}`,
        ...notification,
        read: false,
        timestamp: 'Just now'
    };
    notifications.unshift(newNotification);
    saveData('notifications', notifications);
};

export const addProject = (project: any) => {
    initializeUsers();
    projectsData.unshift(project);
    saveData('projectsData', projectsData);
};

export const addActivityLog = (log: any) => {
    initializeUsers();
    const newLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...log
    };
    activityLogs.unshift(newLog);
    if (activityLogs.length > 50) activityLogs.pop(); // Keep it clean
    saveData('activityLogs', activityLogs);
};

// --- INITIALIZATION ---
export const initializeUsers = () => {
    if (typeof window === 'undefined' || dataInitialized) {
        return;
    }
    
    // Load all data from localStorage, falling back to defaults if not present.
    usersData = loadData('usersData', averpayUsers);
    projectsData = loadData('projectsData', defaultProjects);
    notifications = loadData('notifications', defaultNotifications);
    mockMessages = loadData('mockMessages', defaultMockMessages);
    activityLogs = loadData('activityLogs', defaultActivityLogs);

    dataInitialized = true;
};
