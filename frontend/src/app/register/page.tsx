"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("api/register", {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({username, password}),
        });

        const data = await res.json();
        setMessage(data.message);
    }

    return (
        <main className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Register</h1>
            <form onSubmit={handleRegister} className="flex flex-col gap-3 w-64">
                <input 
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type = "password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border p-2 rounded"
                />
                <button type = "submit" className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                    Register
                </button>
            </form>

            {message && <p className="mt-3 text-gray-700">{message}</p>}

            <p className="mt-5 text-sm">
                Already have an account?{" "}
                <Link href = "/login" className="text-blue-600 hover:underline">
                    Login here
                </Link>
            </p>
        </main>
    );
}