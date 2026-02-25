                </div>
              )}
            </section>
          )}

          {activeTab === 'providers' && (
            <section
              className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
              role="tabpanel"
              aria-labelledby="providers-tab"
              id="providers-panel"
            >
              <header className="mb-6">
                <h2
                  id="providers-heading"
                  className="text-2xl font-bold tracking-tight"
                  style={{color: 'var(--primary)'}}
                >
                  Providers
                </h2>
                <p
                  className="text-sm"
                  style={{color: 'var(--text-secondary)'}}
                  aria-describedby="providers-heading"
                >
                  Manage your saved caregivers and find new ones
                </p>
              </header>

              {tabDataLoading ? (
                <div className="text-center py-12" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--primary)'}}></div>
                  <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading providers...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        navigate('/find-care')
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--bg-primary)',
                        boxShadow: 'var(--shadow-card)'
                      }}>
                      Find New Providers
                    </button>
                    <input
                      type="text"
                      placeholder="Search providers..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-72 px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-light)'
                      } as React.CSSProperties}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                        e.currentTarget.style.boxShadow = 'var(--focus-shadow)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-light)'
                        e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                      }}
                    />
                  </div>

                  <div className="border rounded-lg p-6 text-center" style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)'}}>
                    <User className="w-12 h-12 mx-auto mb-6" style={{color: 'var(--text-secondary)'}} />
                    <h3 className="text-lg font-semibold mb-3 macos-title">No Saved Providers Yet</h3>
                    <p className="mb-6 text-base macos-body" style={{color: 'var(--text-secondary)'}}>
                      Discover and save your favorite caregivers for easy appointment booking.
                    </p>
                    <button
                      onClick={() => {
                        navigate('/find-care')
                      }}
                      className="px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--bg-primary)',
                        boxShadow: 'var(--shadow-card)'
                      }}>
                      Browse Providers
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}const test = (
