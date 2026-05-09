export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Contact Your Rep</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        Enter your address to find your representatives at every level of government and contact them directly.
      </p>

      <form className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Your Street Address
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            name="address"
            placeholder="123 Main St, Springfield, IL 62701"
            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          >
            Find My Reps
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          Your address is used only to look up your representatives and is never stored.
        </p>
      </form>

      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-400 text-sm">
        Enter your address above to see your federal, state, and local representatives.
        <br />
        <span className="text-xs mt-1 block">Powered by Google Civic Information API</span>
      </div>
    </div>
  );
}
