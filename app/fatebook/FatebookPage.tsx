'use client'
import { useState } from 'react'

const FatebookPage = () => {
  const [apiKey, setApiKey] = useState('')

  return (
    <div className="p-4 text-sm text-white max-w-2xl">
      <h1 className="text-lg mb-4">Fatebook Integration</h1>
      <div className="mb-4">
        <div className="mb-1 text-white/70">Login and/or copy your API key from Fatebook</div>
        <div className="flex items-center gap-2">
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your API key here"
            className="px-2 py-1 bg-white/10 outline-none flex-1 text-white placeholder-white/30"
          />
          {apiKey && (
            <button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm cursor-pointer">
              Create prediction
            </button>
          )}
        </div>
      </div>
      <iframe src="https://fatebook.io/api-setup" allow="clipboard-write" className="w-full h-[600px] border-none" />
    </div>
  )
}

export default FatebookPage
