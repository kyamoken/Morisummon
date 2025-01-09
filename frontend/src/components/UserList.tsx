import React, { useEffect, useState } from 'react';

interface User {
    id: number;
    username: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetch('/api/users/')
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div>
            <h1>User List</h1>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.username}</li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
