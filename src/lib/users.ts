
export const averpayUsers = [
    {
        uid: "mock-user-01",
        fullName: "John Doe",
        email: "john.doe@averpay.io",
        password: "cafelink123",
        personalEmail: "john.personal@example.com",
        phone: "+11234567890",
        profilePhoto: "https://avatar.vercel.sh/john-doe.png",
        verificationIdUrl: 'mock-id-john.pdf',
        proofOfAddressUrl: 'mock-address-john.pdf',
        averpayId: "AP-JD12345",
        role: "Webflow Developer",
        location: "New York, USA",
        rank: 12,
        totalBalance: 1250.00,
        pendingBalance: 450.00,
        status: 'active',
        deviceAuthenticated: true,
        browserInfo: "Chrome 122 on macOS",
        lastSeen: new Date().toISOString(),
        bankDetails: {
          bankName: "Bank of America",
          accountHolder: "John Doe",
          accountNumber: "•••• •••• •••• 1234",
        },
        notificationPreferences: {
            projectUpdates: true,
            platformAnnouncements: true,
            darkMode: true
        }
    },
    {
        uid: "mock-user-02",
        fullName: "Ryan Reynolds",
        email: "ryan.reynolds@averpay.io",
        password: "cafelink123",
        personalEmail: "ryan.personal@example.com",
        phone: "+10987654321",
        profilePhoto: "https://avatar.vercel.sh/ryan-reynolds.png",
        verificationIdUrl: 'mock-id-ryan.pdf',
        proofOfAddressUrl: 'mock-address-ryan.pdf',
        averpayId: "AP-RR67890",
        role: "Admin",
        location: "Los Angeles, USA",
        rank: 3,
        totalBalance: 7520.00,
        pendingBalance: 1200.00,
        status: 'active',
        deviceAuthenticated: true,
        browserInfo: "Safari on iPhone",
        lastSeen: new Date().toISOString(),
        bankDetails: {
          bankName: "Chase Bank",
          accountHolder: "Ryan Reynolds",
          accountNumber: "•••• •••• •••• 5678",
        },
        notificationPreferences: {
            projectUpdates: true,
            platformAnnouncements: true,
            darkMode: true
        }
    },
    {
        uid: "mock-user-03",
        fullName: "Bontle Maele",
        email: "bontle.maele@averpay.io",
        password: "cafelink123",
        personalEmail: "bobomaele@gmail.com",
        phone: "+267 74 891 931",
        profilePhoto: "https://avatar.vercel.sh/bontle-maele.png",
        verificationIdUrl: "mock-id-bontle.pdf",
        proofOfAddressUrl: "mock-address-bontle.pdf",
        averpayId: "AP-BM26456",
        role: "Graphic Designer",
        location: "Gaborone, Botswana",
        rank: 58,
        totalBalance: 300900.00,
        pendingBalance: 1650.00,
        status: 'active',
        deviceAuthenticated: true,
        maintenanceFeeDue: 450.0,
        browserInfo: "Edge 121 on Windows",
        lastSeen: new Date().toISOString(),
        bankDetails: {
          bankName: "FNB Botswana",
          accountHolder: "Bontle Maele",
          accountNumber: "•••• •••• •••• 9876",
        },
        notificationPreferences: {
            projectUpdates: true,
            platformAnnouncements: true,
            darkMode: true
        }
    },
    {
        uid: "mock-user-04",
        fullName: "Jane Doe",
        email: "jane.doe@averpay.io",
        password: "cafelink123",
        personalEmail: "jane.personal@example.com",
        phone: "+441234567890",
        profilePhoto: "https://avatar.vercel.sh/jane-doe.png",
        verificationIdUrl: '',
        proofOfAddressUrl: '',
        averpayId: "AP-JD54321",
        role: "UX Researcher",
        location: "London, UK",
        rank: 99,
        totalBalance: 0.00,
        pendingBalance: 0.00,
        status: 'active',
        deviceAuthenticated: true,
        browserInfo: "Firefox on Linux",
        lastSeen: new Date().toISOString(),
        bankDetails: {
          bankName: "",
          accountHolder: "",
          accountNumber: "",
        },
        notificationPreferences: {
            projectUpdates: true,
            platformAnnouncements: true,
            darkMode: true
        }
    }
];

export function findUserByEmail(email: string) {
    if (!email) return undefined;
    return averpayUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(uid: string) {
    if (!uid) return undefined;
    return averpayUsers.find(u => u.uid === uid);
}
