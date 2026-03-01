export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: 24 },
          { label: "Images Uploaded", value: 1482 },
          { label: "Predictions", value: 1309 },
          { label: "Species Tracked", value: 18 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-800">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>
        {[
          { action: "New image uploaded", user: "thabo@gmail.com", time: "2m ago" },
          { action: "Prediction completed", user: "lerato@gmail.com", time: "8m ago" },
          { action: "New user registered", user: "mpho@gmail.com", time: "22m ago" },
        ].map((item, i) => (
          <div key={i} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm text-gray-700">{item.action}</p>
              <p className="text-xs text-gray-400">{item.user}</p>
            </div>
            <span className="text-xs text-gray-400">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}