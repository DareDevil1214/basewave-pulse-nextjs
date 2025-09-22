export function RAGHeader() {
  return (
    <div className="pt-12 md:pt-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">RAG System Dashboard</h1>
          <p className="text-gray-600 text-base md:text-lg">Upload documents and chat with your portal knowledge base</p>
        </div>
        
        {/* Empty div to match DashboardHeader spacing */}
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
        </div>
      </div>
    </div>
  );
}
