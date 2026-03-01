import { useState } from "react";

const mockUsers = [
  { id: 1, email: "admin@wildlife.ac.bw", is_admin: true, is_active: true, date_joined: "2024-01-10" },
  { id: 2, email: "thabo@gmail.com", is_admin: false, is_active: true, date_joined: "2024-02-14" },
  { id: 3, email: "lerato@gmail.com", is_admin: false, is_active: true, date_joined: "2024-03-01" },
  { id: 4, email: "mpho@gmail.com", is_admin: false, is_active: false, date_joined: "2024-04-22" },
];

export default function UserManagement() {
  const [users] = useState(mockUsers);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Email", "Role", "Status", "Joined"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 uppercase tracking-widest font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-4 text-gray-700">{user.email}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.is_admin ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {user.is_admin ? "Admin" : "Conservationist"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium ${user.is_active ? "text-green-600" : "text-gray-400"}`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-400">{user.date_joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}