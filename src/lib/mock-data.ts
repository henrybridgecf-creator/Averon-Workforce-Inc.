
'use client';

import { addDays } from "date-fns";
import { averpayUsers } from './users';
import { triggerEmailNotification, emailTemplates } from "./notifications";

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
            try {
                const parsed = JSON.parse(storedValue);
                // Re-hydrate dates if loading project data
                if (key === 'projectsData' && Array.isArray(parsed)) {
                     return parsed.map((p: any) => ({
                         ...p,
                         submissionDeadline: p.submissionDeadline ? new Date(p.submissionDeadline) : null,
                         submittedAt: p.submittedAt ? new Date(p.submittedAt) : null,
                     })) as unknown as T;
                }
                return parsed;
            } catch (e) {
                console.warn(`Corrupted storage for key: ${key}. Purging and using defaults.`);
                localStorage.removeItem(key);
            }
        }
    } catch (error) {
        console.error(`Failed to load data for key ${key} from localStorage`, error);
    }
    // If no stored value or corrupted, save the default value for next time
    saveData(key as any, defaultValue);
    return defaultValue;
}


// --- INITIAL DATA DEFINITIONS ---

const defaultActivityLogs = [
    { id: 'act-1', type: 'login', user: 'Bontle Prudence', location: 'Gaborone, Botswana', timestamp: new Date().toISOString() },
    { id: 'act-2', type: 'submission', user: 'John Doe', project: 'Sony Review', timestamp: addDays(new Date(), -1).toISOString() },
    { id: 'act-3', type: 'withdrawal', user: 'Ryan Reynolds', amount: 1200, timestamp: addDays(new Date(), -2).toISOString() },
];

const defaultProjects = [
    {
        id: 'proj-sony-01',
        title: 'SONY Product Research & Review',
        description: 'Comprehensive evaluation of upcoming Sony multimedia systems with focus on acoustic fidelity and user interface responsiveness.',
        assignedTo: 'mock-user-03',
        status: 'approved',
        paymentAmount: 9390,
        submissionDeadline: new Date('2024-06-20T23:59:59'),
        briefUrl: '#',
        submissionUrl: 'mock-submission.pdf',
        attachments: [
            { name: 'technical_specs.pdf', size: '2.4MB', url: '#' },
            { name: 'acoustic_analysis.xlsx', size: '1.1MB', url: '#' }
        ],
        submittedAt: new Date('2024-06-18T10:00:00'),
        reviewNote: 'Excellent work, approved.'
    },
    {
        id: 'proj-unilever-01',
        title: 'UNILEVER GLOBAL Product Review',
        description: 'Global audit of Unilever packaging sustainability initiatives and consumer perception across EMEA markets.',
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
        description: 'Quarterly review of Nike performance apparel durability and thermal regulation properties.',
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
        description: 'Critical analysis of Bang & Olufsen mobile experience and multi-room audio synchronization stability.',
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

const defaultNotifications: any[] = [];

const defaultMockMessages = {};


// --- DATA MANIPULATION FUNCTIONS ---

export const signupUser = (user: any) => {
    initializeUsers();
    // Check if duplicate
    if (usersData.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        return { success: false, error: 'Email already exists' };
    }
    usersData.push(user);
    saveData('usersData', usersData);
    return { success: true };
};

export const findUserByEmail = (email: string) => {
    initializeUsers();
    if (!email) return undefined;
    return usersData.find(u => u && u.email && u.email.toLowerCase() === email.toLowerCase());
};

export const findUserById = (uid: string): any | undefined => {
    initializeUsers(); // Ensure data is loaded
    if (!uid) return undefined;
    return usersData.find(u => u && u.uid === uid);
}

export const updateUserData = (userId: string, newValues: any): any | null => {
    initializeUsers(true);
    const userIndex = usersData.findIndex(u => u && u.uid === userId);
    if (userIndex === -1) return null;

    // Deep merge to handle nested objects like bankDetails and notificationPreferences
    const updatedUser = {
        ...usersData[userIndex],
        ...newValues,
        bankDetails: {
            ...(usersData[userIndex].bankDetails || {}),
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
    try {
        const loggedInUserRaw = localStorage.getItem('loggedInUser');
        if(loggedInUserRaw) {
            const loggedInUser = JSON.parse(loggedInUserRaw);
            if(loggedInUser.uid === userId) {
                saveData('loggedInUser', updatedUser);
            }
        }
    } catch (e) {
        console.error("Error updating loggedInUser storage", e);
    }
    
    return updatedUser;
};

export const updateProjectData = (projectId: string, newValues: any): any | null => {
    initializeUsers(true);
    const projectIndex = projectsData.findIndex((p:any) => p && p.id === projectId);
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

export const broadcastNotification = (notification: any) => {
    initializeUsers();
    // In our simplified mock, notifications are global.
    addNotification('all', notification);
};

export const addProject = (project: any) => {
    initializeUsers();
    projectsData.unshift(project);
    saveData('projectsData', projectsData);
};

export const payProject = (projectId: string) => {
    initializeUsers();
    const projectIndex = projectsData.findIndex((p: any) => p.id === projectId);
    if (projectIndex === -1) return null;
    
    const project = projectsData[projectIndex];
    if (project.status === 'paid') return project;

    const user = findUserById(project.assignedTo);
    if (user) {
        const newBalance = (user.totalBalance || 0) + project.paymentAmount;
        updateUserData(user.uid, { totalBalance: newBalance });
        
        projectsData[projectIndex].status = 'paid';
        saveData('projectsData', projectsData);
        
        addNotification(user.uid, {
            type: 'payment',
            title: 'Funds Dispatched',
            description: `Payment of £${project.paymentAmount.toLocaleString()} for "${project.title}" has been credited to your balance.`
        });

        // Trigger Payout Email
        if (user.email) {
            triggerEmailNotification(
                user.email,
                "Averon Workforce - Funds Dispatched",
                emailTemplates.projectApproval(user.fullName, project.title, project.paymentAmount)
            );
        }

        addActivityLog({
            type: 'withdrawal', // Reusing withdrawal for payout log
            user: 'System',
            target: user.fullName,
            amount: project.paymentAmount,
            description: `Auto-dispatched payment for ${project.title}`
        });
    }
    return projectsData[projectIndex];
};

export const payAllApprovedProjects = () => {
    initializeUsers();
    const approvedProjects = projectsData.filter((p: any) => p.status === 'approved');
    let paidCount = 0;
    
    approvedProjects.forEach((p: any) => {
        payProject(p.id);
        paidCount++;
    });
    
    return paidCount;
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
    
    // Dispatch custom event for same-tab reactivity
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('averpayActivity', { detail: newLog }));
    }
};

export const requestPasswordReset = (email: string) => {
    initializeUsers();
    const user = usersData.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        const token = `reset-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('resetToken', JSON.stringify({ token, email, expires: Date.now() + 3600000 }));
        return token;
    }
    return null;
};

export const resetPassword = (token: string, newPassword: string) => {
    initializeUsers();
    const storedTokenRaw = localStorage.getItem('resetToken');
    if (storedTokenRaw) {
        try {
            const { token: storedToken, email, expires } = JSON.parse(storedTokenRaw);
            if (storedToken === token && expires > Date.now()) {
                const user = usersData.find(u => u.email.toLowerCase() === email.toLowerCase());
                if (user) {
                    updateUserData(user.uid, { password: newPassword });
                    localStorage.removeItem('resetToken');
                    return true;
                }
            }
        } catch (e) {
            console.error("Invalid reset token format", e);
        }
    }
    return false;
};

export const requestEmailVerification = async (email: string) => {
    initializeUsers();
    const userIndex = usersData.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex !== -1) {
        const user = usersData[userIndex];
        const token = `verify-${Math.random().toString(36).substring(2, 9)}`;
        const expires = Date.now() + 86400000; // 24h
        
        // Store token on user object
        usersData[userIndex].verificationToken = token;
        usersData[userIndex].verificationExpires = expires;
        saveData('usersData', usersData);

        // Call our internal API to send the actual email
        try {
            const response = await fetch('/api/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    name: user.fullName,
                    token: token
                })
            });

            if (!response.ok) {
                const err = await response.json();
                console.error('Email system failed:', err);
                // We still return the token so the UI can proceed if it wants, 
                // but we log the failure.
            }
        } catch (error) {
            console.error('Failed to trigger verification email:', error);
        }

        return token;
    }
    return null;
};

export const verifyEmailToken = (token: string) => {
    initializeUsers();
    const userIndex = usersData.findIndex(u => u && u.verificationToken === token);
    
    if (userIndex !== -1) {
        const user = usersData[userIndex];
        if (user.verificationExpires && user.verificationExpires > Date.now()) {
            updateUserData(user.uid, { 
                isEmailVerified: true,
                verificationToken: null,
                verificationExpires: null 
            });
            return { success: true, email: user.email };
        }
    }
    return { success: false };
};

export const submitProject = (projectId: string, files: any[]) => {
    initializeUsers();
    const projectIndex = projectsData.findIndex((p: any) => p.id === projectId);
    if (projectIndex === -1) return null;

    const project = projectsData[projectIndex];
    const user = findUserById(project.assignedTo);

    const attachments = files.map(f => ({
        name: f.name,
        size: f.size,
        url: f.url || '#'
    }));

    const updatedProject = {
        ...project,
        status: 'submitted',
        attachments: attachments,
        submittedAt: new Date()
    };

    projectsData[projectIndex] = updatedProject;
    saveData('projectsData', projectsData);

    addActivityLog({
        type: 'submission',
        user: user?.fullName || 'Personnel',
        project: project.title,
        description: `Mission data transmitted for evaluation with ${files.length} attachment(s).`,
        timestamp: new Date().toISOString()
    });

    return updatedProject;
};

// --- INITIALIZATION ---
export const initializeUsers = (force = false) => {
    if (typeof window === 'undefined' || (dataInitialized && !force)) {
        return;
    }
    
    // Load users with normalization to prevent crashes
    const rawUsers = loadData('usersData', averpayUsers);
    
    // Safety check: ensure rawUsers is an array and filter out non-objects
    const safeUsers = Array.isArray(rawUsers) ? rawUsers.filter(u => u && typeof u === 'object') : [];

    const normalizedUsers = safeUsers.map((u: any) => ({
        ...u,
        totalBalance: Number(u.totalBalance || 0),
        pendingBalance: Number(u.pendingBalance || 0),
        maintenanceFeeDue: Number(u.maintenanceFeeDue || 0),
        bankDetails: {
            bankName: u.bankDetails?.bankName || '',
            accountHolder: u.bankDetails?.accountHolder || '',
            accountNumber: u.bankDetails?.accountNumber || '',
        },
        notificationPreferences: {
            projectUpdates: u.notificationPreferences?.projectUpdates ?? true,
            platformAnnouncements: u.notificationPreferences?.platformAnnouncements ?? true,
            darkMode: u.notificationPreferences?.darkMode ?? true,
        },
        lastSeen: u.lastSeen || new Date().toISOString()
    }));

    usersData.length = 0;
    usersData.push(...normalizedUsers);

    const loadedProjects = loadData('projectsData', defaultProjects);
    projectsData.length = 0;
    projectsData.push(...loadedProjects);

    const loadedNotifications = loadData('notifications', defaultNotifications);
    notifications.length = 0;
    notifications.push(...loadedNotifications);

    const loadedMessages = loadData('mockMessages', defaultMockMessages);
    Object.keys(mockMessages).forEach(k => delete mockMessages[k]);
    Object.assign(mockMessages, loadedMessages);

    const loadedLogs = loadData('activityLogs', defaultActivityLogs);
    activityLogs.length = 0;
    activityLogs.push(...loadedLogs);

    dataInitialized = true;
};
