export function DashboardHeader() {
  return (
    <div className="pt-12 md:pt-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-base md:text-lg">Welcome back to your intelligence platform</p>
        </div>
        
        {/* New People Portal Button */}
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={() => window.open('https://www.new-people.cv/', '_blank')}
            className="group relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 rounded-xl px-4 py-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <img
                src="/logo-load.webp"
                alt="New People"
                className="w-8 h-8 object-cover"
              />
              <span className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors text-sm">New People</span>
              <div className="text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
