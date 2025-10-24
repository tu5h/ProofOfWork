// lib/users.ts
export interface User{
    username: string;
    password: string;
}

// This will act like a mini-database for now
const users: User[] = [];

export function addUser(user: User) {
    users.push(user);
}

export function findUser(username: string, password?: string): User | undefined {
    return users.find(u => u.username === username && (!password || u.password === password));
}

export function userExists(username: string): boolean {
    return users.some(u => u.username === username);
}
